from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..auth import check_credentials, create_token, VALID_ROLES

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest):
    if data.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Cargo inválido. Use: {', '.join(sorted(VALID_ROLES))}")
    if not check_credentials(data.username, data.password):
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos.")
    return TokenResponse(access_token=create_token(data.role), role=data.role)
