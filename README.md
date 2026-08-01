# 🚚 TMS Web - Sistema de Gestão de Transporte e Clientes

Aplicação Full-Stack moderna para gerenciamento de clientes, funcionários e logs de auditoria, desenvolvida com arquitetura modular e autenticação segura via JWT.

---

## 🛠️ Tecnologias Utilizadas

### **Backend**
* **Python 3.13+**
* **FastAPI** (Framework web de alta performance)
* **SQLAlchemy** (ORM para persistência e manipulação do banco de dados)
* **SQL Server** (Banco de dados relacional)
* **PyJWT & Passlib / Bcrypt** (Autenticação e hash de senhas)
* **Uvicorn** (Servidor ASGI)

### **Frontend**
* **React** (Biblioteca para interface SPA)
* **Vite** (Build tool e dev server ultrarrápido)
* **Axios** (Cliente HTTP com interceptors para tokens de autorização)

---

## 📁 Estrutura do Projeto

```text
TmsWeb/
├── backend/            # API RESTful (FastAPI + SQLAlchemy)
│   ├── app/
│   │   ├── api/        # Endpoints e Rotas (v1)
│   │   ├── core/       # Configurações de segurança e variáveis
│   │   ├── db/         # Sessão e conexão com SQL Server
│   │   ├── models/     # Entidades do Banco de Dados
│   │   └── schemas/    # Schemas de validação Pydantic
│   └── main.py         # Ponto de entrada do FastAPI
│
├── frontend/           # Single Page Application (React + Vite)
│   ├── src/
│   │   ├── pages/      # Telas (Login, Clientes, Funcionários)
│   │   └── services/   # Configuração do Axios e Interceptors
│   └── vite.config.js
│
└── SqlScripts/         # Scripts de criação e população de tabelas SQL