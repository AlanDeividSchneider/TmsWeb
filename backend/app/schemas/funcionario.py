from pydantic import BaseModel
from typing import Optional
from app.schemas.perfil import PerfilResponse

class FuncionarioBase(BaseModel):
    NOME: str
    UNIDADE: str
    CPF: str
    LOGIN: str
    PERFIL: int

class FuncionarioCreate(FuncionarioBase):
    SENHA: str

class FuncionarioUpdate(BaseModel):
    NOME: Optional[str] = None
    UNIDADE: Optional[str] = None
    CPF: Optional[str] = None
    LOGIN: Optional[str] = None
    SENHA: Optional[str] = None
    PERFIL: Optional[int] = None

class FuncionarioResponse(FuncionarioBase):
    ID: int
    perfil_rel: Optional[PerfilResponse] = None

    class Config:
        from_attributes = True