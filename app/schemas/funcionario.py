from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FuncionarioBase(BaseModel):
    NOME: str
    UNIDADE: str
    CPF: str
    LOGIN: str
    PERFIL: str

class FuncionarioCreate(FuncionarioBase):
    SENHA: str

class FuncionarioResponse(FuncionarioBase):
    ID: int
    CRIADO: datetime

    class Config:
        from_attributes = True