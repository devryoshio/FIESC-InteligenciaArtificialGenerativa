from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Shadow Speak API", description="Backend do aplicativo de fluência de idiomas")

# Configuração de Segurança (CORS)
# Permite que o Frontend (localhost:5173) consiga enviar dados para cá
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permite conexões de qualquer origem durante o desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos de Dados (Validação automática do FastAPI)
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

# Rota Raiz para testar se o servidor está vivo
@app.get("/")
def read_root():
    return {"status": "online", "message": "A API do Shadow Speak está rodando perfeitamente!"}

# Rota de Login
@app.post("/api/login")
def login(user: LoginRequest):
    # Aqui no futuro conectaremos com um Banco de Dados. Por enquanto, é um mock:
    if user.email == "teste@email.com" and user.password == "123456":
        return {
            "status": "success", 
            "token": "token-falso-para-testes-123", 
            "user": {"email": user.email}
        }
    
    # Se a senha estiver errada, retorna um erro 401 (Não Autorizado)
    raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")

# Rota de Cadastro
@app.post("/api/register")
def register(new_user: RegisterRequest):
    # Simula a criação de um usuário
    return {
        "status": "success", 
        "message": "Usuário criado com sucesso", 
        "user": {"name": new_user.name, "email": new_user.email}
    }