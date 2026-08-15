from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from app.schemas.permissao import PermissaoResponse  # Importando do novo schema

class PerfilBase(BaseModel):
    NOME: str
    DESCRICAO: Optional[str] = None

class PerfilCreate(PerfilBase):
    NOME: str
    DESCRICAO: Optional[str] = None
    PERMISSAO_IDS: Optional[List[int]] = []

class PerfilUpdate(BaseModel):
    NOME: Optional[str] = None
    DESCRICAO: Optional[str] = None

class PerfilPermissoesUpdate(BaseModel):
    PERMISSAO_IDS: List[int]

class PerfilResponse(BaseModel):
    ID: int
    NOME: str
    DESCRICAO: Optional[str] = None
    permissoes: List[PermissaoResponse] = []

    model_config = ConfigDict(from_attributes=True)