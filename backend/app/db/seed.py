"""Seed idempotente: python -m app.db.seed

Carga el admin, un cliente de demostración, 3 categorías y 8 productos con stock.
Se puede ejecutar varias veces: no duplica nada.
"""
from app.core.database import create_all_tables
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.pedidos import models as _pedidos_models  # noqa: F401  (registra tablas)
from app.modules.productos.models import Producto
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

USUARIOS = [
    # (username, full_name, email, password, role)
    ("admin", "Administrador", "admin@foodstore.com", "Admin1234!", "admin"),
    ("cliente", "Cliente Demo", "cliente@foodstore.com", "Cliente1234!", "user"),
]

CATEGORIAS = [
    ("Pizzas", "Pizzas al molde y a la piedra"),
    ("Hamburguesas", "Hamburguesas artesanales"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
]

# (categoria, nombre, descripcion, precio, stock)
PRODUCTOS = [
    ("Pizzas", "Muzzarella", "Clásica con muzzarella", 9500.0, 20),
    ("Pizzas", "Napolitana", "Con tomate, ajo y albahaca", 11000.0, 15),
    ("Pizzas", "Fugazzeta", "Cebolla y queso", 11500.0, 10),
    ("Hamburguesas", "Clásica", "Carne, lechuga y tomate", 8500.0, 25),
    ("Hamburguesas", "Doble cheddar", "Doble carne y cheddar", 10500.0, 18),
    ("Bebidas", "Gaseosa 500ml", "Línea cola", 2500.0, 50),
    ("Bebidas", "Agua mineral 500ml", "Sin gas", 1800.0, 50),
    ("Bebidas", "Cerveza artesanal", "Lata 473ml", 4200.0, 30),
]


def seed_usuarios() -> None:
    with UsuarioUnitOfWork() as uow:
        for username, full_name, email, password, role in USUARIOS:
            if uow.usuarios.get_by_username(username) is None:
                uow.usuarios.add(
                    Usuario(
                        username=username,
                        full_name=full_name,
                        email=email,
                        hashed_password=hash_password(password),
                        role=role,
                    )
                )


def seed_catalogo() -> None:
    with ProductoUnitOfWork() as uow:
        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = uow.categorias.get_by_nombre(nombre)
            if categoria is None:
                categoria = uow.categorias.add(Categoria(nombre=nombre, descripcion=descripcion))
            categorias[nombre] = categoria

        for cat_nombre, nombre, descripcion, precio, stock in PRODUCTOS:
            if uow.productos.get_by_nombre(nombre) is None:
                uow.productos.add(
                    Producto(
                        categoria_id=categorias[cat_nombre].id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                    )
                )


def run() -> None:
    create_all_tables()
    seed_usuarios()
    seed_catalogo()
    print("Seed OK")
    print("  admin   / Admin1234!   (rol admin)")
    print("  cliente / Cliente1234! (rol user)")


if __name__ == "__main__":
    run()
