from fastapi import APIRouter
from app.api.v1.endpoints import auth, clientes, funcionarios

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
api_router.include_router(clientes.router, prefix="/clientes", tags=["Clientes"])
api_router.include_router(funcionarios.router, prefix="/funcionarios", tags=["Funcionários"])