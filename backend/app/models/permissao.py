from sqlalchemy import Column, Integer, String, Table, ForeignKey
from app.db.base import Base

# Tabela intermediária de ligação entre Perfil e Permissão (N:N)
perfil_permissao = Table(
    "T_PERFIL_PERMISSAO",
    Base.metadata,
    Column("PERFIL_ID", Integer, ForeignKey("T_PERFIL.ID"), primary_key=True),
    Column("PERMISSAO_ID", Integer, ForeignKey("T_PERMISSAO.ID"), primary_key=True),
)

# Classe da tabela principal de Permissões
class Permissao(Base):
    __tablename__ = "T_PERMISSAO"

    ID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    CHAVE = Column(String(100), nullable=False, unique=True)
    NOME = Column(String(100), nullable=False)
    MODULO = Column(String(50), nullable=False)
    DESCRICAO = Column(String(200), nullable=True)