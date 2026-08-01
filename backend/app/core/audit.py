import json
from sqlalchemy.orm import Session
from app.models.log import Log

def registrar_log(
    db: Session,
    usuario_id: int,
    acao: str,
    tabela: str,
    registro_id: int,
    detalhes: dict = None
):
    """Grava um registro de log na tabela T_LOGS."""
    log_entry = Log(
        USUARIOID=usuario_id,
        ACAO=acao,
        TABELA=tabela,
        REGISTROID=registro_id,
        DETALHES=json.dumps(detalhes, ensure_ascii=False, default=str) if detalhes else None
    )
    db.add(log_entry)
    db.commit()