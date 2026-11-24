from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
# Importar todos los modelos registra las tablas y resuelve las relaciones.
from app.modules.categorias import models as _categorias_models  # noqa: F401
from app.modules.pedidos import models as _pedidos_models  # noqa: F401
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos import models as _productos_models  # noqa: F401
from app.modules.productos.router import router as productos_router
from app.modules.usuarios import models as _usuarios_models  # noqa: F401
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all_tables()
    yield


app = FastAPI(title="Food Store API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api/v1")


@api_router.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


api_router.include_router(auth_router)
api_router.include_router(usuarios_router)
api_router.include_router(categorias_router)
api_router.include_router(productos_router)
api_router.include_router(pedidos_router)

app.include_router(api_router)
