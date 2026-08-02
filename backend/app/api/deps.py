from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.config import settings
from app.core.security import verify_password
from app.schemas.auth import TokenData
from app.models.funcionario import Funcionario

# Define a rota onde o Swagger do FastAPI buscará o token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_db() -> Generator:
    """Abre e fecha a conexão com o banco de dados a cada requisição."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> Funcionario:
    """Valida o token JWT e retorna o funcionário autenticado."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais de acesso",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        login: str = payload.get("sub")
        perfil: int = payload.get("perfil")
        usuario_id: int = payload.get("id")
        
        if login is None:
            raise credentials_exception
        token_data = TokenData(login=login, perfil=perfil, usuario_id=usuario_id)
    except JWTError:
        raise credentials_exception

    user = db.query(Funcionario).filter(Funcionario.LOGIN == token_data.login).first()
    if user is None:
        raise credentials_exception
    return user

def requer_permissao(chave_exigida: str):
    """
    Função fábrica que recebe a CHAVE da permissão (ex: 'FUNCIONARIOS_CRIAR')
    e verifica se o usuário logado possui essa permissão no seu perfil.
    """
    def verificador(current_user: Funcionario = Depends(get_current_user)) -> Funcionario:
        # Se o usuário não tiver perfil associado
        if not current_user.perfil_rel:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuário não possui um perfil associado."
            )

        # Coleta todas as CHAVES de permissão vinculadas ao perfil do usuário logado
        chaves_do_usuario = [p.CHAVE for p in current_user.perfil_rel.permissoes]

        # Se a chave necessária não estiver na lista de permissões dele, bloqueia!
        if chave_exigida not in chaves_do_usuario:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acesso negado. Requer permissão: '{chave_exigida}'"
            )

        return current_user

    return verificador