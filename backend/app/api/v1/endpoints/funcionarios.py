from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.api.deps import get_db, requer_permissao
from app.models.funcionario import Funcionario
from app.schemas.funcionario import (
    FuncionarioCreate,
    FuncionarioUpdate,
    FuncionarioResponse,
)
from app.core.security import get_password_hash
from app.core.audit import registrar_log

router = APIRouter()


@router.get("/", response_model=List[FuncionarioResponse])
def read_funcionarios(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Funcionario = Depends(requer_permissao("FUNCIONARIOS_VER")),
) -> Any:
    """
    Lista todos os funcionários.
    Exige a permissão: FUNCIONARIOS_VER
    """
    # 👈 Adicionado .order_by(Funcionario.ID) para suportar a paginação no SQL Server
    funcionarios = (
        db.query(Funcionario)
        .order_by(Funcionario.ID)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return funcionarios


@router.get("/{id}", response_model=FuncionarioResponse)
def read_funcionario_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: Funcionario = Depends(requer_permissao("FUNCIONARIOS_VER")),
) -> Any:
    """
    Busca um funcionário específico pelo ID.
    Exige a permissão: FUNCIONARIOS_VER
    """
    funcionario = db.query(Funcionario).filter(Funcionario.ID == id).first()
    if not funcionario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Funcionário não encontrado.",
        )
    return funcionario


@router.post("/", response_model=FuncionarioResponse, status_code=status.HTTP_201_CREATED)
def create_funcionario(
    *,
    db: Session = Depends(get_db),
    funcionario_in: FuncionarioCreate,
    current_user: Funcionario = Depends(requer_permissao("FUNCIONARIOS_CRIAR")),
) -> Any:
    """
    Cadastra um novo funcionário.
    Exige a permissão: FUNCIONARIOS_CRIAR
    """
    # Verifica se já existe um funcionário com o mesmo CPF
    user_cpf = db.query(Funcionario).filter(Funcionario.CPF == funcionario_in.CPF).first()
    if user_cpf:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um funcionário cadastrado com este CPF.",
        )

    # Verifica se já existe um funcionário com o mesmo LOGIN
    user_login = db.query(Funcionario).filter(Funcionario.LOGIN == funcionario_in.LOGIN).first()
    if user_login:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este login já está em uso por outro funcionário.",
        )

    # Cria o novo registro encriptando a senha
    db_obj = Funcionario(
        NOME=funcionario_in.NOME,
        UNIDADE=funcionario_in.UNIDADE,
        CPF=funcionario_in.CPF,
        LOGIN=funcionario_in.LOGIN,
        SENHA=get_password_hash(funcionario_in.SENHA),
        PERFIL=funcionario_in.PERFIL,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)

    # Grava Log de Auditoria
    registrar_log(
        db=db,
        usuario_id=current_user.ID,
        acao="INSERT",
        tabela="T_FUNCIONARIO",
        registro_id=db_obj.ID,
        detalhes=funcionario_in.model_dump(),
    )

    return db_obj


@router.put("/{id}", response_model=FuncionarioResponse)
def update_funcionario(
    *,
    db: Session = Depends(get_db),
    id: int,
    funcionario_in: FuncionarioUpdate,
    current_user: Funcionario = Depends(requer_permissao("FUNCIONARIOS_EDITAR")),
) -> Any:
    """
    Atualiza os dados de um funcionário existente.
    Exige a permissão: FUNCIONARIOS_EDITAR
    """
    funcionario = db.query(Funcionario).filter(Funcionario.ID == id).first()
    if not funcionario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Funcionário não encontrado.",
        )

    estado_anterior = {
        "NOME": funcionario.NOME,
        "UNIDADE": funcionario.UNIDADE,
        "CPF": funcionario.CPF,
        "LOGIN": funcionario.LOGIN,
        "PERFIL": funcionario.PERFIL,
    }

    # Atualiza apenas os campos enviados no payload
    update_data = funcionario_in.model_dump(exclude_unset=True)
    
    # Se a senha foi informada para atualização, gera o hash
    if "SENHA" in update_data and update_data["SENHA"]:
        update_data["SENHA"] = get_password_hash(update_data["SENHA"])

    for field, value in update_data.items():
        setattr(funcionario, field, value)

    db.add(funcionario)
    db.commit()
    db.refresh(funcionario)

    estado_novo = {
        "NOME": funcionario.NOME,
        "UNIDADE": funcionario.UNIDADE,
        "CPF": funcionario.CPF,
        "LOGIN": funcionario.LOGIN,
        "PERFIL": funcionario.PERFIL,
    }

    detalhes_log = {
        "antes": estado_anterior,
        "depois": estado_novo,
    }

    # Grava Log de Auditoria
    registrar_log(
        db=db,
        usuario_id=current_user.ID,
        acao="UPDATE",
        tabela="T_FUNCIONARIO",
        registro_id=funcionario.ID,
        detalhes=detalhes_log,
    )

    return funcionario


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_funcionario(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: Funcionario = Depends(requer_permissao("FUNCIONARIOS_DELETAR")),
):
    """
    Remove um funcionário do sistema.
    Exige a permissão: FUNCIONARIOS_DELETAR
    """
    funcionario = db.query(Funcionario).filter(Funcionario.ID == id).first()
    if not funcionario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Funcionário não encontrado.",
        )

    # Evita que o próprio usuário logado se auto-delete
    if funcionario.ID == current_user.ID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível remover a sua própria conta.",
        )

    # Armazena os dados do registro antes de deletar do banco
    registro_id = funcionario.ID
    nome_funcionario = funcionario.NOME

    # Deleta o funcionário
    db.delete(funcionario)
    db.commit()

    # Grava Log de Auditoria
    registrar_log(
        db=db,
        usuario_id=current_user.ID,
        acao="DELETE",
        tabela="T_FUNCIONARIO",
        registro_id=registro_id,
        detalhes={"id": registro_id, "nome": nome_funcionario},
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)