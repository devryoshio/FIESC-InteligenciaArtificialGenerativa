from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, practice

# Cria as tabelas automaticamente no SQLite assim que o servidor liga
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Shadow Speak API 🚀", 
    description="Backend profissional organizado em módulos e integrado com SQLite real."
)

# Configuração do CORS para o Frontend conversar com o Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui as rotas do arquivo routers/auth.py
app.include_router(auth.router)
app.include_router(practice.router)

@app.get("/")
def read_root():
    return {"status": "online", "database": "SQLite Conectado com sucesso!"}