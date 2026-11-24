from collections.abc import Callable

from fastapi import Cookie, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario


def get_current_user(
    access_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session),
) -> Usuario:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado"
    )
    if not access_token:
        raise credentials_error
    payload = decode_access_token(access_token)
    if payload is None or "sub" not in payload:
        raise credentials_error
    user = session.exec(
        select(Usuario).where(Usuario.username == payload["sub"])
    ).first()
    if user is None:
        raise credentials_error
    return user


def get_current_active_user(user: Usuario = Depends(get_current_user)) -> Usuario:
    if user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada"
        )
    return user


def require_role(roles: list[str]) -> Callable[[Usuario], Usuario]:
    def checker(user: Usuario = Depends(get_current_active_user)) -> Usuario:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Permisos insuficientes"
            )
        return user

    return checker
