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