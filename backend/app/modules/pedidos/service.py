from datetime import datetime, timezone

from app.modules.pedidos.models import DetallePedido, EstadoPedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado  # noqa: F401  (se re-exporta)


# ---------- Excepciones de dominio ----------
class PedidoNoEncontrado(Exception):
    """404"""


class PedidoAjeno(Exception):
    """403"""


class ReglaDeNegocio(Exception):
    """Base de las reglas que responden 400."""


class StockInsuficiente(ReglaDeNegocio): ...


class ProductoNoDisponible(ReglaDeNegocio): ...


class ProductoRepetido(ReglaDeNegocio): ...


class TransicionInvalida(ReglaDeNegocio): ...


# ---------- Máquina de estados (RN-02) ----------
TRANSICIONES: dict[str, set[str]] = {
    EstadoPedido.PENDIENTE: {EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO},
    EstadoPedido.EN_PREPARACION: {EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO},
    EstadoPedido.ENTREGADO: set(),  # terminal
    EstadoPedido.CANCELADO: set(),  # terminal
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ---------- helpers ----------
    @staticmethod
    def _get_pedido(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    @staticmethod
    def _cambiar_estado(uow: PedidoUnitOfWork, pedido: Pedido, nuevo: str) -> None:
        """Valida la transición ANTES de modificar nada (RN-02). RN-03: restituye stock."""
        if nuevo not in TRANSICIONES[pedido.estado]:
            raise TransicionInvalida(
                f"Transición inválida: {pedido.estado} → {nuevo}"
            )
        if nuevo == EstadoPedido.CANCELADO:
            for linea in pedido.items:
                producto = uow.productos.get_by_id(linea.producto_id)
                if producto is not None:  # aunque esté dado de baja, se restituye
                    producto.stock += linea.cantidad
                    uow.productos.add(producto)
        pedido.estado = nuevo.value if isinstance(nuevo, EstadoPedido) else nuevo
        pedido.updated_at = _now()
        uow.pedidos.add(pedido)

    # ---------- RN-01: crear ----------
    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Hay productos repetidos en el pedido")

            pedido = Pedido(
                usuario_id=usuario_id,
                estado=EstadoPedido.PENDIENTE.value,
                forma_pago=data.forma_pago.value,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0.0,
            )
            uow.pedidos.add(pedido)  # INSERT (flush): obtiene el id

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"Producto {item.producto_id} no encontrado"
                    )
                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto '{producto.nombre}' no está disponible"
                    )
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}' "
                        f"(disponible: {producto.stock})"
                    )

                producto.stock -= item.cantidad  # descuenta en la misma iteración
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.detalles.add(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,  # copia (RN-05)
                        precio_unitario=producto.precio_base,  # copia (RN-05)
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)
        # __exit__: commit; si hubo excepción, rollback (tampoco se descuenta stock)

    # ---------- lecturas ----------
    def listar(
        self,
        *,
        usuario_id: int,
        es_admin: bool,
        estado: EstadoPedido | None,
        skip: int,
        limit: int,
    ) -> PedidosPaginados:
        with self.uow as uow:
            items, total = uow.pedidos.search(
                usuario_id=None if es_admin else usuario_id,  # RN-04
                estado=estado.value if estado else None,
                skip=skip,
                limit=limit,
            )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in items]
            )

    def obtener(self, pedido_id: int, *, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get_pedido(uow, pedido_id)
            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            inicio_hoy = _now().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=por_estado.get(EstadoPedido.PENDIENTE.value, 0),
                en_preparacion=por_estado.get(EstadoPedido.EN_PREPARACION.value, 0),
                entregados=por_estado.get(EstadoPedido.ENTREGADO.value, 0),
                cancelados=por_estado.get(EstadoPedido.CANCELADO.value, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=uow.pedidos.sum_total_by_estado(
                    EstadoPedido.ENTREGADO.value
                ),
            )

    # ---------- RN-02 / RN-03 / RN-04: cambios de estado ----------
    def cambiar_estado(self, pedido_id: int, nuevo: EstadoPedido) -> PedidoRead:
        """Admin: avanza o cancela desde cualquier estado no terminal."""
        with self.uow as uow:
            pedido = self._get_pedido(uow, pedido_id)
            self._cambiar_estado(uow, pedido, nuevo)
            return PedidoRead.model_validate(pedido)

    def cancelar_propio(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        """Dueño: solo sus pedidos y solo desde PENDIENTE."""
        with self.uow as uow:
            pedido = self._get_pedido(uow, pedido_id)
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != EstadoPedido.PENDIENTE:
                raise TransicionInvalida("Solo se puede cancelar un pedido PENDIENTE")
            self._cambiar_estado(uow, pedido, EstadoPedido.CANCELADO)
            return PedidoRead.model_validate(pedido)
