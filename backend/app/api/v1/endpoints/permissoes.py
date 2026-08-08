from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.api.deps import get_db, requer_permissao
from app.models.funcionario import Funcionario
from app.models.permissao import Permissao
from app.models.perfil import Perfil  # Ajuste conforme o caminho do seu modelo de Perfil
from app.schemas.permissao import PermissaoResponse
from app.schemas.perfil import PerfilResponse, PerfilPermissoesUpdate
from app.core.audit import registrar_log
from sqlalchemy import text

router = APIRouter()

@router.get("/todas", response_model=List[PermissaoResponse])
def listar_todas_permissoes(
    db: Session = Depends(get_db),
    current_user: Funcionario = Depends(requer_permissao("PERMISSOES_VER")),
) -> Any:
    """
    Lista todas as permissões cadastradas no sistema para montagem da tela.
    """
    return db.query(Permissao).all()


@router.get("/perfis", response_model=List[PerfilResponse])
def listar_perfis(
    db: Session = Depends(get_db),
    current_user: Funcionario = Depends(requer_permissao("PERMISSOES_VER")),
):
    # O joinedload força o ORM a buscar as permissões via JOIN em uma única consulta
    perfis = db.query(Perfil).options(joinedload(Perfil.permissoes)).all()
    return perfis

@router.put("/perfis/{perfil_id}", response_model=PerfilResponse)
def atualizar_permissoes_perfil(
    *,
    db: Session = Depends(get_db),
    perfil_id: int,
    payload: PerfilPermissoesUpdate,
    current_user: Funcionario = Depends(requer_permissao("PERMISSOES_EDITAR")),
) -> Any:
    """
    Atualiza as permissões associadas a um Perfil específico.
    Exige permissão: PERMISSOES_EDITAR
    """
    perfil = db.query(Perfil).filter(Perfil.ID == perfil_id).first()
    if not perfil:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil não encontrado.",
        )

    # Estado anterior para o Log de Auditoria
    permissoes_antes = [p.CHAVE for p in perfil.permissoes]

    # Busca os objetos de permissão enviados no payload
    novas_permissoes = db.query(Permissao).filter(Permissao.ID.in_(payload.PERMISSAO_IDS)).all()

    # Sobreve e atualiza o relacionamento N:N
    perfil.permissoes = novas_permissoes
    db.add(perfil)
    db.commit()
    db.refresh(perfil)

    permissoes_depois = [p.CHAVE for p in perfil.permissoes]

    # Gravação do Log de Auditoria
    registrar_log(
        db=db,
        usuario_id=current_user.ID,
        acao="UPDATE",
        tabela="T_PERFIL_PERMISSAO",
        registro_id=perfil.ID,
        detalhes={
            "perfil": perfil.NOME,
            "antes": permissoes_antes,
            "depois": permissoes_depois,
        },
    )

    return perfil

