from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.base import Base

class Funcionario(Base):
    __tablename__ = "T_FUNCIONARIO"

    ID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    NOME = Column(String(150), nullable=False)
    UNIDADE = Column(String(100), nullable=False)
    CPF = Column(String(11), unique=True, nullable=False, index=True)
    LOGIN = Column(String(50), unique=True, nullable=False, index=True)
    SENHA = Column(String(255), nullable=False)
    PERFIL = Column(String(20), nullable=False)
    CRIADO = Column(DateTime, default=datetime.utcnow, nullable=False)