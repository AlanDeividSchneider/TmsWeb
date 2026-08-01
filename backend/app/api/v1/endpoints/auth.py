from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.core.security import verify_password, create_access_token
from app.models.funcionario import Funcionario
from app.schemas.auth import Token
from app.schemas.funcionario import FuncionarioResponse

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    Endpoint padrão OAuth2 para autenticação.
    O Swagger/Frontend enviará 'username' (nosso LOGIN) e 'password' (nossa SENHA).
    """
    # 1. Busca o usuário no SQL Server pelo LOGIN
    user = db.query(Funcionario).filter(Funcionario.LOGIN == form_data.username).first()
    
    # 2. Valida existência e senha criptografada
    if not user or not verify_password(form_data.password, user.SENHA):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Gera o Token JWT contendo ID, LOGIN e PERFIL
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_payload = {
        "sub": user.LOGIN,
        "perfil": user.PERFIL,
        "id": user.ID
    }
    
    access_token = create_access_token(
        data=token_payload, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=FuncionarioResponse)
def read_users_me(current_user: Funcionario = Depends(get_current_user)):
    """Retorna os dados do usuário atualmente logado (útil para o Frontend)."""
    return current_user