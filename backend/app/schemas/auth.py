from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    login: Optional[str] = None
    perfil: Optional[int] = None
    usuario_id: Optional[int] = None

class LoginRequest(BaseModel):
    login: str
    senha: str