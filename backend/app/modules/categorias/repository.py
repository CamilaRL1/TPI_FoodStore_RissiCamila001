from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Busca entre TODAS (activas e inactivas): la baja lógica no libera el nombre."""
        return self.session.exec(
            select(Categoria).where(Categoria.nombre == nombre)
        ).first()

    def list_activas(self) -> list[Categoria]:
        stmt = select(Categoria).where(col(Categoria.activo).is_(True)).order_by(Categoria.id)
        return list(self.session.exec(stmt).all())
