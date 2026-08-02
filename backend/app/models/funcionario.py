from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.perfil import Perfil

class Funcionario(Base):
    __tablename__ = "T_FUNCIONARIO"

    ID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    NOME = Column(String(150), nullable=False)
    UNIDADE = Column(String(100), nullable=False)
    CPF = Column(String(11), nullable=False, unique=True)
    LOGIN = Column(String(50), nullable=False, unique=True)
    SENHA = Column(String(255), nullable=False)   
    PERFIL = Column(Integer, ForeignKey("T_PERFIL.ID"), nullable=False)
    CRIADO = Column(DateTime, server_default=func.now(), nullable=False)
    perfil_rel = relationship("Perfil", back_populates="funcionarios", lazy="joined")