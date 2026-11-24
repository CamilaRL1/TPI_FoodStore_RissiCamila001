# Food Store

Sistema de pedidos de comida. Trabajo Práctico Integrador de **Programación 4** (Tecnicatura Universitaria en Programación UTN).

- **Alumna:** Camila Rissi (comisión 12)
- **Repositorio:** `https://github.com/CamilaRL1/TPI_FoodStore_RissiCamila001.git` 
- **Video de demostración:** https://drive.google.com/drive/folders/1C6stDMpfvJUlhy3h7DgdFtY8LVOzHHs_?usp=sharing

Dos proyectos independientes que se comunican por HTTP:

| Carpeta | Stack |
|---|---|
| `backend/` | FastAPI + SQLModel + PostgreSQL, arquitectura en capas con Unit of Work |
| `frontend/` | React + TypeScript + Vite + Tailwind, TanStack Query/Form/Table, Zustand, Axios |

La sesión viaja en una **cookie HttpOnly** (`access_token`) con un JWT: el frontend nunca lee ni guarda el token.

## Requisitos

- Python **3.11 a 3.13** (SQLModel 0.0.22 no funciona con 3.14)
- Node.js **20.19 o superior** y **pnpm 9 o superior**
- PostgreSQL 15 o superior (para desarrollo local se acepta SQLite, ver más abajo)

## Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate         
pip install -r requirements.txt
cp .env.example .env             
python -m app.db.seed             
uvicorn app.main:app --reload
```

- API: `http://localhost:8000/api/v1`
- Documentación: `http://localhost:8000/docs` y `http://localhost:8000/redoc`

### Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://user:pass@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Firma del JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |

**Desarrollo sin PostgreSQL:** usar `DATABASE_URL=sqlite:///./foodstore.db`.

Con PostgreSQL, crear antes la base: `createdb foodstore_db`.

## Frontend

```bash
cd frontend
cp .env.example .env             
pnpm install
pnpm build                      
pnpm dev
```

- Aplicación: `http://localhost:5173`

### Variables de entorno (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

## Usuarios del seed

El seed (`python -m app.db.seed`) es **idempotente**: se puede ejecutar varias veces sin duplicar datos.

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | `admin` |
| `cliente` | `Cliente1234!` | `user` |

También carga 3 categorías (Pizzas, Hamburguesas, Bebidas) y 8 productos con stock.

## Arquitectura

### Backend (`backend/app/`)

```
core/        config, database, security, deps, unit_of_work, base_repository
modules/
  auth/        router, service, schemas
  usuarios/    models, schemas, repository, unit_of_work, service, router
  categorias/  models, schemas, repository, unit_of_work, service, router
  productos/   models, schemas, repository, unit_of_work, service, router
  pedidos/     models, schemas, repository, unit_of_work, service, router
db/seed.py   carga inicial idempotente
main.py      FastAPI, CORS con credenciales y prefijo /api/v1
```

Cadena por módulo: **Router → Service → Unit of Work → Repository → Model**, con dependencias unidireccionales.

- El **commit/rollback/close** ocurre solo en el `__exit__` del `UnitOfWork`. Ningún Service ni Router llama a `session.commit()`.
- El Router obtiene el Service con `Depends(get_<modulo>_service)` y nunca abre el Unit of Work.
- El Service abre `with self.uow as uow:`, aplica las reglas y devuelve el schema de salida dentro del bloque. Nunca se expone un modelo de tabla.
- El Service lanza **excepciones de dominio** y el Router las traduce a `HTTPException`.

### Reglas de negocio de pedidos

| Regla | Implementación |
|---|---|
| **RN-01** Crear pedido | Una sola transacción: sin ítems repetidos; por cada ítem se verifica producto activo, disponible y stock, se descuenta y se crea la línea copiando nombre y precio. Si algo falla, no se persiste nada. |
| **RN-02** Transiciones | Diccionario en el Service. `PENDIENTE → EN_PREPARACION / CANCELADO`, `EN_PREPARACION → ENTREGADO / CANCELADO`; `ENTREGADO` y `CANCELADO` son terminales. Transición inválida: 400. |
| **RN-03** Cancelar | Restituye el stock de cada línea en la misma transacción que cambia el estado. |
| **RN-04** Permisos | El cliente solo ve y cancela sus pedidos, y solo desde `PENDIENTE` (403 si es ajeno). El admin ve todos. |
| **RN-05** Inmutabilidad | Líneas y total fijos. No existe endpoint de edición ni de borrado. |
| **RN-06** Datos | `forma_pago` (`EFECTIVO` / `TRANSFERENCIA`) y `direccion_entrega` (5 a 200 caracteres) se validan en el schema. |

### Frontend (`frontend/src/`)

```
shared/      api (axiosInstance, handleApiError, queryClient, queryKeys), ui, components, layout, types, utils
features/    auth, categorias, productos, pedidos, usuarios  (index.ts, pages, components, hooks, api, types)
store/       authStore y cartStore (Zustand + persist)
routes/      AppRouter y ProtectedRoute
```

#### Reglas de la arquitectura por features

1. Cada feature expone su API pública en `features/<nombre>/index.ts` (páginas, hooks y tipos que usan otras partes de la aplicación). Nada fuera de una feature importa sus subcarpetas internas (`api/`, `hooks/`, `components/`, `types/`, `pages/`): se importa siempre desde el `index.ts`.
2. Las páginas y los componentes no llaman a Axios: lo hacen las funciones de `api/`, que consumen solo los hooks de TanStack Query de la propia feature.
3. `shared/` no depende de ninguna feature. Lo que comparten varias features vive en `shared/`: las claves de TanStack Query en `shared/api/queryKeys.ts` (así una feature invalida datos de otra sin importarla) y el tipo `EstadoPedido` en `shared/types/estadoPedido.ts`.
4. El interceptor de Axios no conoce el `authStore`: recibe un callback con `setUnauthorizedHandler`, que registra el `authStore` al crearse.
5. `routes/` importa las páginas únicamente desde los `index.ts` de cada feature.

Excepciones permitidas y documentadas:

- `productos` importa el tipo `Categoria` y el hook `useCategorias` desde el `index.ts` de `categorias` (el producto trae su categoría anidada y los formularios necesitan el listado).
- `auth` importa los tipos de usuario desde el `index.ts` de `usuarios`, porque el backend reutiliza el modelo `Usuario`.
- `store/authStore.ts` importa las funciones de `features/auth/api/auth.ts` directamente: la capa `store/` es la que orquesta la sesión, y pasar por el `index.ts` de `auth` crearía una dependencia circular (`auth/index` → `LoginPage` → `authStore` → `auth/index`).
- `shared/layout/Navbar.tsx` lee `authStore` y `cartStore`, como indica la consigna.

- **TanStack Query** gestiona el estado del servidor (catálogo, pedidos, usuarios, resumen), con `queryKey` descriptivas e invalidación en `onSuccess`.
- **Zustand** gestiona el estado del cliente: sesión (`authStore`, que persiste solo `usuario`, nunca el token) y carrito (`cartStore`).
- **Axios** con `withCredentials: true` e interceptor: ante un 401 fuera de `/auth/token` y `/auth/me`, o ante «Cuenta de usuario desactivada», limpia el `authStore`.
- **ProtectedRoute** redirige a `/login` sin sesión y a `/unauthorized` si el rol no alcanza. La protección real está en el backend (`require_role`).
- La única llamada en `useEffect` es `checkSession` al montar la aplicación.

## Endpoints principales

Todos bajo `/api/v1`. Detalle completo en `/docs`.

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/auth/register`, `/auth/token`, `/auth/logout` | Público |
| GET | `/auth/me` | Sesión |
| GET | `/admin/usuarios` · POST `/admin/usuarios/{id}/activar` · `/desactivar` | admin |
| GET | `/categorias`, `/categorias/{id}` | Público |
| POST / PUT / DELETE | `/categorias`, `/categorias/{id}` | admin |
| GET | `/productos` (`skip`, `limit`, `search`, `categoria_id`, `disponible`), `/productos/{id}` | Público |
| POST / PUT / PATCH / DELETE | `/productos`, `/productos/{id}`, `/productos/{id}/stock` | admin |
| POST / GET | `/pedidos` | Sesión |
| GET | `/pedidos/resumen` | admin |
| GET | `/pedidos/{id}` | Dueño o admin |
| PATCH | `/pedidos/{id}/estado` | admin |
| PATCH | `/pedidos/{id}/cancelar` | Dueño |

Códigos de error comunes: `401` sin sesión válida, `400` cuenta desactivada o regla de negocio, `403` rol no permitido o pedido ajeno, `404` inexistente (una baja lógica se trata como inexistente), `409` duplicado, `422` validación.

## Alcance

Incluye: autenticación con JWT en cookie HttpOnly y dos roles, catálogo con baja lógica, carrito persistido en el navegador, pedidos con máquina de 4 estados, descuento y restitución de stock, pago manual y panel de administración.

Fuera de alcance: direcciones guardadas, varias categorías por producto, historial de estados, gráficos, pasarela de pago, pruebas automatizadas y notificaciones.
