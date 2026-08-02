from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.cliente import Cliente
from app.models.funcionario import Funcionario
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteResponse
from app.core.audit import registrar_log

router = APIRouter()

# 1. CRIAR CLIENTE (ADMINISTRADOR, SUPORTE, CLIENTE)
@router.post("/", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
def criar_cliente(
    cliente_in: ClienteCreate,
    db: Session = Depends(get_db),
    current_user: Funcionario = Depends(get_current_user)
):
    # Verifica se CPF/CNPJ já existe
    if db.query(Cliente).filter(Cliente.CPFCNPJ == cliente_in.CPFCNPJ).first():
        raise HTTPException(status_code=400, detail="CPF/CNPJ já cadastrado no sistema.")

    novo_cliente = Cliente(**cliente_in.model_dump())
    db.add(novo_cliente)
    db.commit()
    db.refresh(novo_cliente)

    # Grava Log de Auditoria
    registrar_log(
        db=db,
        usuario_id=current_user.ID,
        acao="INSERT",
        tabela="T_CLIENTE",
        registro_id=novo_cliente.ID,
        detalhes=cliente_in.model_dump()
    )

    return novo_cliente


# 2. LISTAR CLIENTES
@router.get("/", response_model=List[ClienteResponse])
def listar_clientes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Funcionario = Depends(get_current_user)
):
    clientes = (
        db.query(Cliente)
        .order_by(Cliente.ID)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return clientes


# 3. ATUALIZAR CLIENTE (ADMINISTRADOR, SUPORTE, CLIENTE)
@router.put("/{cliente_id}", response_model=ClienteResponse)
def atualizar_cliente(
    cliente_id: int,
    cliente_in: ClienteUpdate,
    db: Session = Depends(get_db),
    current_user: Funcionario = Depends(get_current_user)
):
    cliente = db.query(Cliente).filter(Cliente.ID == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    dados_antigos = {"NOME": cliente.NOME, "UNIDADE": cliente.UNIDADE, "CPFCNPJ": cliente.CPFCNPJ}
    dados_novos = cliente_in.model_dump(exclude_unset=True)

    for campo, valor in dados_novos.items():
        setattr(cliente, campo, valor)

    db.commit()
    db.refresh(cliente)

    # Grava Log de Auditoria
    registrar_log(
        db=db,
        usuario_id=current_user.ID,
        acao="UPDATE",
        tabela="T_CLIENTE",
        registro_id=cliente.ID,
        detalhes={"antes": dados_antigos, "depois": dados_novos}
    )

    return cliente


# 4. EXCLUIR CLIENTE (APENAS SUPORTE E ADMINISTRADOR)
@router.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    current_user: Funcionario = Depends(get_current_user)
):
    # Regra de negócio: Perfil CLIENTE não pode excluir!
    if current_user.PERFIL not in [1, 2]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seu perfil de usuário não tem permissão para excluir registros."
        )

    cliente = db.query(Cliente).filter(Cliente.ID == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    db.delete(cliente)
    db.commit()

    # Grava Log de Auditoria
    registrar_log(
        db=db,
        usuario_id=current_user.ID,
        acao="DELETE",
        tabela="T_CLIENTE",
        registro_id=cliente_id,
        detalhes={"NOME": cliente.NOME, "CPFCNPJ": cliente.CPFCNPJ}
    )