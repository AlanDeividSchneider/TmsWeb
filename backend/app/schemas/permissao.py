from pydantic import BaseModel
from typing import Optional

class PermissaoBase(BaseModel):
    CHAVE: str
    NOME: str
    MODULO: str
    DESCRICAO: Optional[str] = None

class PermissaoCreate(PermissaoBase):
    pass

class PermissaoResponse(PermissaoBase):
    ID: int

    class Config:
        from_attributes = True