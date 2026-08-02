@echo off
title Iniciando TMS Web

echo ====================================
echo    Iniciando Servidor Backend (FastAPI)
echo ====================================
start "TMS Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload"

echo ====================================
echo    Iniciando Servidor Frontend (Vite)
echo ====================================
start "TMS Frontend" cmd /k "cd frontend && npm run dev"

echo ====================================
echo    TMS Web iniciado com sucesso!
echo ====================================