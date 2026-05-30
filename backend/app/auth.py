from __future__ import annotations
import os
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = os.getenv("SECRET_KEY", "linitech-dev-secret-CHANGE-IN-PRODUCTION-32chars")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "linitech")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "lini@2026")
TOKEN_EXPIRE_HOURS = int(os.getenv("TOKEN_EXPIRE_HOURS", "8"))
ALGORITHM = "HS256"
VALID_ROLES = {"rh", "ti", "gestor"}

_bearer = HTTPBearer()


def create_token(role: str) -> str:
    payload = {
        "sub": ADMIN_USERNAME,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _decode(credentials: HTTPAuthorizationCredentials = Security(_bearer)) -> dict:
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado. Faça login novamente.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido.")


def verify_token(payload: dict = Depends(_decode)) -> str:
    return payload["sub"]


def require_rh(payload: dict = Depends(_decode)) -> str:
    if payload.get("role") != "rh":
        raise HTTPException(status_code=403, detail="Apenas o RH tem permissão para esta ação.")
    return payload["sub"]


def check_credentials(username: str, password: str) -> bool:
    ok_user = secrets.compare_digest(username.encode(), ADMIN_USERNAME.encode())
    ok_pass = secrets.compare_digest(password.encode(), ADMIN_PASSWORD.encode())
    return ok_user and ok_pass
