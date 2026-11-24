from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

connect_args = (
    {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)


def create_all_tables() -> None:
    # Importar los modelos antes de llamar para que queden registrados.
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine)


def get_session() -> Generator[Session, None, None]:
    """Solo para dependencias de lectura (deps.py). Las reglas de negocio usan el UoW."""
    with Session(engine) as session:
        yield session
