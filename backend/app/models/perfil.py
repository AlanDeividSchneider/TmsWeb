from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.permissao import perfil_permissao

class Perfil(Base):
    __tablename__ = "T_PERFIL"

    ID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    NOME = Column(String(50), nullable=False, unique=True)
    DESCRICAO = Column(String(150), nullable=True)
    funcionarios = relationship("Funcionario", back_populates="perfil_rel")
    permissoes = relationship("Permissao", secondary=perfil_permissao, lazy="joined")