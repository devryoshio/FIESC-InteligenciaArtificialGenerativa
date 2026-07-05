Excelente decisão! Passar de dados simulados (*mockados*) para um banco de dados real é o divisor de águas que transforma um protótipo em um sistema de verdade.

Para fazer isso da forma correta e profissional (o que vai garantir uma nota excelente na organização do seu projeto), não podemos deixar tudo jogado dentro do `main.py`. Vamos aplicar o padrão de arquitetura mais recomendado para o FastAPI, separando as responsabilidades de cada arquivo.

Aqui está o passo a passo completo para reestruturar o seu backend com **SQLite** e **SQLAlchemy** (o conector de banco de dados mais famoso do Python).

---

### Passo 1: Instalar o SQLAlchemy

Certifique-se de que o seu terminal está dentro da pasta `backend` e com o ambiente virtual ativo `(venv)`. Rode o comando para instalar a biblioteca do banco de dados:

```bash
pip install sqlalchemy

```

---

### Passo 2: A Nova Estrutura de Pastas

O seu backend vai deixar de ser apenas um arquivo e vai ganhar esta cara organizada. Crie os arquivos e a pasta `routers` conforme o mapa abaixo dentro da pasta `backend`:

```text
backend/
├── routers/
│   └── auth.py       # Apenas as rotas de Login e Cadastro
├── main.py           # Inicialização do servidor e CORS
├── database.py       # Conexão com o SQLite
├── models.py         # Como as tabelas serão salvas no Banco
└── schemas.py        # Validação dos dados (Pydantic)

```

Agora, vamos colar o código em cada um desses arquivos:

---

### Passo 3: Configurar a Conexão (`database.py`)

Crie o arquivo **`database.py`** na raiz da pasta `backend`. Ele será responsável por criar o arquivo físico do banco de dados (`shadow_speak.db`) e gerenciar as conexões.

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Define o arquivo local do SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./shadow_speak.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Função utilitária para abrir e fechar a conexão com o banco automaticamente
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

```

---

### Passo 4: Definir a Tabela de Usuários (`models.py`)

Crie o arquivo **`models.py`** na raiz da pasta `backend`. Ele diz ao SQLite como a tabela de usuários deve ser estruturada no disco.

```python
from sqlalchemy import Column, Integer, String
from database import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String) # Nota: Em produção usaríamos hash, vamos focar no banco primeiro!

```

---

### Passo 5: Configurar os Contratos de Dados (`schemas.py`)

Crie o arquivo **`schemas.py`** na raiz da pasta `backend`. O FastAPI usa isso para validar o que o usuário digita (garantindo que ele mande um e-mail válido, por exemplo) e o que a API devolve.

```python
from pydantic import BaseModel, EmailStr

# O que é comum para o Usuário
class UserBase(BaseModel):
    email: EmailStr

# Dados necessários para Criar um Usuário
class UserCreate(UserBase):
    name: str
    password: str

# Dados necessários para Logar
class UserLogin(UserBase):
    password: str

# Como a API vai devolver o usuário (Esconde a senha por segurança)
class UserResponse(UserBase):
    id: int
    name: str

    class Config:
        from_attributes = True

```

---

### Passo 6: Criar as Rotas Isoladas (`routers/auth.py`)

Crie uma pasta chamada **`routers`** dentro do backend. Dentro dela, crie o arquivo **`auth.py`**. É aqui que a mágica acontece: ele vai salvar e buscar as informações diretamente no banco de dados real.

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/api", tags=["Autenticação"])

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. Verifica se o e-mail já existe no banco de dados
    db_user = db.query(models.UserModel).filter(models.UserModel.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado.")

    # 2. Se não existir, cria o novo usuário
    new_user = models.UserModel(
        name=user.name,
        email=user.email,
        password=user.password  # Salvando direto para fins didáticos iniciais
    )
    
    # 3. Salva permanentemente no SQLite
    db.add(new_user)
    db.commit()
    db.refresh(new_user) # Atualiza o objeto para pegar o ID gerado pelo banco
    return new_user

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    # 1. Busca o usuário pelo e-mail
    db_user = db.query(models.UserModel).filter(models.UserModel.email == user.email).first()
    
    # 2. Verifica se o usuário existe e se a senha bate
    if not db_user or db_user.password != user.password:
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    # 3. Retorna o sucesso com os dados reais do banco
    return {
        "status": "success",
        "token": f"token-real-user-{db_user.id}",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email
        }
    }

```

---

### Passo 7: Limpar o arquivo Principal (`main.py`)

Agora, abra o seu arquivo **`main.py`** original, **apague tudo** o que estava lá e substitua por este código limpo. Ele serve apenas para ligar o servidor e incluir o roteador de autenticação que acabamos de criar.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth

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

@app.get("/")
def read_root():
    return {"status": "online", "database": "SQLite Conectado com sucesso!"}

```

---

### Hora do Teste Real!

Rode o servidor novamente no terminal:

```bash
uvicorn main:app --reload

```

1. Assim que o comando rodar, você vai notar que um arquivo chamado **`shadow_speak.db`** vai aparecer sozinho na pasta `backend`. O banco de dados foi criado!
2. Abra o navegador em: **`http://localhost:8000/docs`**
3. Use a rota **`/api/register`** para cadastrar um usuário real (coloque nome, e-mail e senha). Clique em Execute. Ele vai salvar no banco.
4. Depois, vá na rota **`/api/login`** e tente logar com uma senha errada. Ele vai te barrar. Tente logar com os dados que acabou de cadastrar e ele vai te dar o acesso.

Essa estrutura é o padrão de mercado para projetos profissionais com FastAPI. O que achou dessa organização? Se o teste no Swagger der certo, avise para conectarmos o Frontend nessas rotas reais!