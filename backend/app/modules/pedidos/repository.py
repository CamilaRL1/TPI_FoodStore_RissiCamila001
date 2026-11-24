from datetime import datetime

from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def search(
        self,
        *,
        usuario_id: int | None = None,
        estado: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Pedido], int]:
        conds = []
        if usuario_id is not None:
            conds.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            conds.append(Pedido.estado == estado)

        total = self.session.exec(
            select(func.count()).select_from(Pedido).where(*conds)
        ).one()
        items = self.session.exec(
            select(Pedido)
            .where(*conds)
            .order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return list(items), total

    def list_by_usuario(
        self, usuario_id: int, *, estado: str | None = None, skip: int = 0, limit: int = 20
    ) -> tuple[list[Pedido], int]:
        return self.search(usuario_id=usuario_id, estado=estado, skip=skip, limit=limit)

    def count_by_estado(self) -> dict[str, int]:
        rows = self.session.exec(
            select(Pedido.estado, func.count()).group_by(Pedido.estado)
        ).all()
        return {estado: n for estado, n in rows}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        ).one()

    def sum_total_by_estado(self, estado: str) -> float:
        total = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0.0)).where(Pedido.estado == estado)
        ).one()
        return float(total)


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, DetallePedido)
