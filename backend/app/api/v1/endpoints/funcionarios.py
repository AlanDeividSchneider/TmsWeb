from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.funcionario import Funcionario
from app.schemas.funcionario import FuncionarioCreate, FuncionarioUpdate, FuncionarioResponse
from app.core.security import get_password_hash
from app.core.audit import registrar_log

router = APIRouter()

# Helper para validar perfil de Administrador
def verificar_admin(user: Funcionario):
    if user.PERFIL != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado: Apenas administradores podem gerenciar usuários."
        )

# 1. CADASTRAR FUNCIONÁRIO
@router.post("/", response_model=FuncionarioResponse, status_code=status.HTTP_201_CREATED)
def criar_funcionario(
    func_in: FuncionarioCreate,
    db: Session = Depends(get_db),
    current_user: Funcionario = Depends(get_current_user)
):
    verificar_admin(current_user)

    # Verifica se LOGIN ou CPF já existem
    if db.query(Funcionario).filter(Funcionario.LOGIN == func_in.LOGIN).first():
        raise HTTPException(status_code=400, detail="Este LOGIN já está em uso.")
    if db.query(Funcionario).filter(Funcionario.CPF == func_in.CPF).first():
        raise HTTPException(status_code=400, detail="Este CPF já está cadastrado.")

    # Criptografa a senha antes de salvar no SQL Server
    dados_dict = func_in.model_dump()
    dados_dict["SENHA"] = get_password_hash(func_in.SENHA)

    novo_func = Funcionario(**dados_dict)
    db.add(novo_func)
    db.commit()
    db.refresh(novo_func)

    # Registro no Log de Auditoria
    registrar_log(
        db=db,
        usuario_id=current_user.ID,
        acao="INSERT",
        tabela="T_FUNCIONARIO",
        registro_id=novo_func.ID,
        detalhes={"NOME": novo_func.NOME, "LOGIN": novo_func.LOGIN, "PERFIL": novo_func.PERFIL}
    )

    return novo_func

# 2. LISTAR FUNCIONÁRIOS
@router.get("/", response_model=List[FuncionarioResponse])
def listar_funcionarios(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Funcionario = Depends(get_current_user)
):
    verificar_admin(current_user)
    
    # Com order_by exigido pelo SQL Server para offset/limit
    return (
        db.query(Funcionario)
        .order_by(Funcionario.ID)
        .offset(skip)
        .limit(limit)
        .all()
    )

# 3. ATUALIZAR FUNCIONÁRIO (PERFIL OU SENHA)
@router.put("/{func_id}", response_model=FuncionarioResponse)
def atualizar_funcionario(
    func_id: int,
    func_in: FuncionarioUpdate,
    db: Session = Depends(get_db),
    current_user: Funcionario = Depends(get_current_user)
):
    verificar_admin(current_user)

    func = db.query(Funcionario).filter(Funcionario.ID == func_id).first()
    if not func:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado.")

    dados_atualizar = func_in.model_dump(exclude_unset=True)

    # Se a senha foi informada na atualização, faz o hash dela
    if "SENHA" in dados_atualizar and dados_atualizar["SENHA"]:
        dados_atualizar["SENHA"] = get_password_hash(dados_atualizar["SENHA"])

    for campo, valor in dados_atualizar.items():
        setattr(func, campo, valor)

    db.commit()
    db.refresh(func)

    # Omitir a hash da senha do detalhe do log por segurança
    detalhes_log = {k: v for k, v in dados_atualizar.items() if k != "SENHA"}
    
    registrar_log(
        db=db,
        usuario_id=current_user.ID,
        acao="UPDATE",
        tabela="T_FUNCIONARIO",
        registro_id=func.ID,
        detalhes=detalhes_log
    )

    return func