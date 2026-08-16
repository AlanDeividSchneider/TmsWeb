from pydantic import BaseModel, Field, ConfigDict, EmailStr
from datetime import datetime
from typing import Optional

class ClienteBase(BaseModel):
    CPFCNPJ: str = Field(..., min_length=11, max_length=14)
    NOME: str = Field(..., max_length=150)
    UNIDADE: str = Field(..., max_length=100)
    INSCRICAO_ESTADUAL: Optional[str] = None
    EMAIL: Optional[EmailStr] = None
    CEP: Optional[str] = None
    ENDERECO: Optional[str] = None
    NUMERO: Optional[str] = None
    BAIRRO: Optional[str] = None
    CIDADE: Optional[str] = None
    ESTADO: Optional[str] = Field(None, max_length=2)
    TELEFONE: Optional[str] = None
    CELULAR: Optional[str] = None
    CODIGO_IBGE_CIDADE: Optional[str] = None

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    NOME: Optional[str] = Field(None, max_length=150)
    UNIDADE: Optional[str] = Field(None, max_length=100)
    CPFCNPJ: Optional[str] = Field(None, min_length=11, max_length=14)
    INSCRICAO_ESTADUAL: Optional[str] = None
    EMAIL: Optional[EmailStr] = None
    CEP: Optional[str] = None
    ENDERECO: Optional[str] = None
    NUMERO: Optional[str] = None
    BAIRRO: Optional[str] = None
    CIDADE: Optional[str] = None
    ESTADO: Optional[str] = Field(None, max_length=2)
    TELEFONE: Optional[str] = None
    CELULAR: Optional[str] = None
    CODIGO_IBGE_CIDADE: Optional[str] = None

class ClienteResponse(ClienteBase):
    ID: int
    CRIADO: datetime
    ATUALIZADO: Optional[datetime] = None

    # Sintaxe correta do Pydantic v2 (remova qualquer "class Config" que houver abaixo)
    model_config = ConfigDict(from_attributes=True)