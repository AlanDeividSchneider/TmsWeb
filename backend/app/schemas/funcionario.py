from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class FuncionarioBase(BaseModel):
    NOME: str = Field(..., max_length=150)
    UNIDADE: str = Field(..., max_length=100)
    CPF: str = Field(..., min_length=11, max_length=11)
    LOGIN: str = Field(..., max_length=50)
    PERFIL: str = Field(..., max_length=20, description="ADMINISTRADOR, SUPORTE ou CLIENTE")

class FuncionarioCreate(FuncionarioBase):
    SENHA: str = Field(..., min_length=6, max_length=100)

class FuncionarioUpdate(BaseModel):
    NOME: Optional[str] = Field(None, max_length=150)
    UNIDADE: Optional[str] = Field(None, max_length=100)
    PERFIL: Optional[str] = Field(None, max_length=20)
    SENHA: Optional[str] = Field(None, min_length=6)

class FuncionarioResponse(FuncionarioBase):
    ID: int
    CRIADO: datetime

    model_config = ConfigDict(from_attributes=True)