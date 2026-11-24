from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Abre la sesión en __enter__; commit/rollback y close en __exit__.

    Los UoW de cada módulo heredan de esta clase y, en su __enter__,
    crean los repositorios sobre self.session.
    """

    session: Session

    def __enter__(self) -> "UnitOfWork":
        self.session = session_factory()
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
