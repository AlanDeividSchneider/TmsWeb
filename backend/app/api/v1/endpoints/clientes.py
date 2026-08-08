from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db, requer_permissao
from app.models.cliente import Cliente
from app.models.funcionario import Funcionario
from app.schemas.cliente import (
    ClienteCreate,
    ClienteUpdate,
    ClienteResponse,
)
from app.core.audit import registrar_log  # Ajuste o import conforme a localização da sua função de log

router = APIRouter()


@router.get("/", response_model=List[ClienteResponse])
def read_clientes(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Funcionario = Depends(requer_permissao("CLIENTES_VER")),
) -> Any:
    """
    Lista todos os clientes com ordenação.
    Exige a permissão: CLIENTES_VER
    """
    clientes = (
        db.query(Cliente)
        .order_by(Cliente.ID)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return clientes


@router.get("/{id}", response_model=ClienteResponse)
def read_cliente_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: Funcionario = Depends(requer_permissao("CLIENTES_VER")),
) -> Any:
    """
    Busca um cliente pelo ID.
    Exige a permissão: CLIENTES_VER
    """
    cliente = db.query(Cliente).filter(Cliente.ID == id).first()
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado.",
        )
    return cliente


@router.post("/", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
def create_cliente(
    *,
    db: Session = Depends(get_db),
    cliente_in: ClienteCreate,
    current_user: Funcionario = Depends(requer_permissao("CLIENTES_CRIAR")),
) -> Any:
    """
    Cadastra um novo cliente e grava log de auditoria.
    Exige a permissão: CLIENTES_CRIAR
    """
    # Validação de duplicidade por documento se existir no schema
    if hasattr(cliente_in, "DOCUMENTO") and cliente_in.DOCUMENTO:
        existente = db.query(Cliente).filter(Cliente.DOCUMENTO == cliente_in.DOCUMENTO).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe um cliente cadastrado com este documento.",
            )

    db_obj = Cliente(**cliente_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)

    # Grava Log de Auditoria
    registrar_log(
        db=db,
        usuario_id=current_user.ID,
        acao="INSERT",
        tabela="T_CLIENTE",
        registro_id=db_obj.ID,
        detalhes=cliente_in.model_dump(),
    )

    return db_obj


@router.put("/{id}", response_model=ClienteResponse)
def update_cliente(
    *,
    db: Session = Depends(get_db),
    id: int,
    cliente_in: ClienteUpdate,
    current_user: Funcionario = Depends(requer_permissao("CLIENTES_EDITAR")),
) -> Any:
    """
    Atualiza dados de um cliente existente e grava log de auditoria.
    Exige a permissão: CLIENTES_EDITAR
    """
    cliente = db.query(Cliente).filter(Cliente.ID == id).first()
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado.",
        )

    estado_anterior = {
        "NOME": cliente.NOME,
        "UNIDADE": cliente.UNIDADE,
        "CPFCNPJ": cliente.CPFCNPJ
    }

    update_data = cliente_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cliente, field, value)

    db.add(cliente)
    db.commit()
    db.refresh(cliente)

    estado_novo = {
            "NOME": cliente.NOME,
            "UNIDADE": cliente.UNIDADE,
            "CPFCNPJ": cliente.CPFCNPJ
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
        tabela="T_CLIENTE",
        registro_id=cliente.ID,
        detalhes=detalhes_log,
    )

    return cliente


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cliente(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: Funcionario = Depends(requer_permissao("CLIENTES_DELETAR")),
):
    """
    Remove um cliente e grava log de auditoria.
    Exige a permissão: CLIENTES_DELETAR
    """
    cliente = db.query(Cliente).filter(Cliente.ID == id).first()
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado.",
        )

    registro_id = cliente.ID
    db.delete(cliente)
    db.commit()

    # Grava Log de Auditoria
    registrar_log(
        db=db,
        usuario_id=current_user.ID,
        acao="DELETE",
        tabela="T_CLIENTE",
        registro_id=registro_id,
        detalhes={"id": registro_id, "nome": getattr(cliente, "NOME", None)},
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)