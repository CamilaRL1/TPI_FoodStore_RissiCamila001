from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_by_nombre(self, nombre: str) -> Producto | None:
        return self.session.exec(select(Producto).where(Producto.nombre == nombre)).first()

    def search(
        self,
        *,
        nombre: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        solo_activos: bool = True,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Producto], int]:
        conds = []
        if solo_activos:
            conds.append(col(Producto.activo).is_(True))
        if nombre:
            conds.append(col(Producto.nombre).ilike(f"%{nombre}%"))
        if categoria_id is not None:
            conds.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            conds.append(col(Producto.disponible).is_(disponible))

        total = self.session.exec(
            select(func.count()).select_from(Producto).where(*conds)
        ).one()
        items = self.session.exec(
            select(Producto).where(*conds).order_by(Producto.id).offset(skip).limit(limit)
        ).all()
        return list(items), total
