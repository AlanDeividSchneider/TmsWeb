from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.base import Base

class Cliente(Base):
    __tablename__ = "T_CLIENTE"

    ID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    CPFCNPJ = Column(String(14), unique=True, nullable=False, index=True)
    NOME = Column(String(150), nullable=False)
    UNIDADE = Column(String(100), nullable=False)
    CRIADO = Column(DateTime, default=datetime.utcnow, nullable=False)
    ATUALIZADO = Column(DateTime, onupdate=datetime.utcnow, nullable=True)
    INSCRICAO_ESTADUAL = Column(String(20), nullable=True)
    EMAIL = Column(String(150), nullable=True)
    CEP = Column(String(10), nullable=True)
    ENDERECO = Column(String(255), nullable=True)
    NUMERO = Column(String(20), nullable=True)
    BAIRRO = Column(String(100), nullable=True)
    CIDADE = Column(String(100), nullable=True)
    ESTADO = Column(String(2), nullable=True)
    TELEFONE = Column(String(20), nullable=True)
    CELULAR = Column(String(20), nullable=True)
    CODIGO_IBGE_CIDADE = Column(String(7), nullable=True)