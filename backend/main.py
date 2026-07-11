from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from routers import auth, practice, lessons
import os

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path



# Cria as tabelas automaticamente no SQLite assim que o servidor liga
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Shadow Speak API 🚀", 
    description="Backend profissional organizado em módulos e integrado com SQLite real."
)


# Libera a pasta de 'uploads' para o navegador acessar os áudios criados
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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
app.include_router(lessons.router)




@app.get("/health")
def health():
    return {
        "status": "ok"
    }



frontend_path = Path("frontend/dist")

if frontend_path.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=frontend_path / "assets"),
        name="assets"
    )

    @app.get("/{full_path:path}")
    async def serve_react(full_path: str):
        index = frontend_path / "index.html"

        if index.exists():
            return FileResponse(index)

        return {"erro": "Frontend não encontrado"}