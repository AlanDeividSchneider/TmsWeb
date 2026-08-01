from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime
from app.db.base import Base

class Log(Base):
    __tablename__ = "T_LOGS"

    ID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    USUARIOID = Column(Integer, ForeignKey("T_FUNCIONARIO.ID", ondelete="SET NULL"), nullable=True)
    ACAO = Column(String(10), nullable=False)
    TABELA = Column(String(50), nullable=False)
    REGISTROID = Column(Integer, nullable=False)
    DATAHORA = Column(DateTime, default=datetime.utcnow, nullable=False)
    DETALHES = Column(Text, nullable=True)