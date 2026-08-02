from pydantic import BaseModel
from typing import Optional

class PerfilBase(BaseModel):
    NOME: str
    DESCRICAO: Optional[str] = None

class PerfilCreate(PerfilBase):
    pass

class PerfilResponse(PerfilBase):
    ID: int

    class Config:
        from_attributes = True