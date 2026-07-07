Isso é o que separa um simples "protótipo" de um **produto real**! Registrar o histórico de tentativas e os pontos permite criar gráficos, mostrar a evolução do aluno e gamificar o aplicativo no futuro.

Para fazer isso, nós vamos criar uma tabela nova no banco de dados chamada `attempts` (tentativas). Toda vez que o aluno gravar o áudio e o servidor calcular a nota, ele já salva automaticamente no banco qual foi a lição, o que o aluno falou e a nota que tirou.

Aqui está o passo a passo direto ao ponto:

### Passo 1: Atualizar o Banco de Dados (`models.py`)

Como vamos criar uma tabela nova, **apague o arquivo `shadow_speak.db**` na pasta do backend para ele ser recriado com a nova estrutura.

Abra o arquivo **`backend/models.py`** e adicione a nova tabela no final. Note que adicionei o `DateTime` para sabermos quando a tentativa foi feita!

```python
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from database import Base
import datetime

class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

class LessonModel(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    phrase = Column(String, index=True)
    audio_path = Column(String, nullable=True)

# NOVA TABELA: Registra cada gravação que o usuário faz
class AttemptModel(Base):
    __tablename__ = "attempts"
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id")) # Liga a tentativa com a lição
    score = Column(Integer)                               # A nota (0 a 100)
    transcript = Column(String)                           # O que o servidor entendeu que ele falou
    created_at = Column(DateTime, default=datetime.datetime.utcnow) # Data e hora automática

```

---

### Passo 2: Salvar a nota na Rota de Prática (`routers/practice.py`)

Agora precisamos avisar a rota de áudio que, além de devolver a nota para o frontend, ela deve salvar isso no banco.

Abra o arquivo **`backend/routers/practice.py`** e atualize ele com as importações do banco de dados e a lógica de salvamento:

```python
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
import speech_recognition as sr
from pydub import AudioSegment
import io
import models

router = APIRouter(prefix="/api", tags=["Prática de Voz"])

def calcular_porcentagem_acerto(frase_original: str, frase_dita: str) -> int:
    orig = "".join(c for c in frase_original.lower() if c.isalnum() or c.isspace()).split()
    dita = "".join(c for c in frase_dita.lower() if c.isalnum() or c.isspace()).split()

    if not orig:
        return 0

    acertos = 0
    for i, palavra in enumerate(orig):
        if i < len(dita) and palavra == dita[i]:
            acertos += 1

    porcentagem = int((acertos / len(orig)) * 100)
    return porcentagem

@router.post("/analyze-voice")
async def analyze_voice(
    lesson_id: int = Form(...), # NOVO: Recebe o ID da lição
    phrase: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db) # NOVO: Conexão com o banco de dados
):
    try:
        audio_bytes = await file.read()

        audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes))
        wav_io = io.BytesIO()
        audio_segment.export(wav_io, format="wav")
        wav_io.seek(0)

        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_io) as source:
            audio_data = recognizer.record(source)

        try:
            texto_transcrito = recognizer.recognize_google(audio_data, language="en-US")
        except sr.UnknownValueError:
            texto_transcrito = ""
        except sr.RequestError:
            raise HTTPException(status_code=503, detail="Serviço de reconhecimento indisponível")

        nota = calcular_porcentagem_acerto(phrase, texto_transcrito)
        transcript_final = texto_transcrito if texto_transcrito else "(Áudio não compreendido)"

        # NOVO: Salva o resultado no banco de dados!
        nova_tentativa = models.AttemptModel(
            lesson_id=lesson_id,
            score=nota,
            transcript=transcript_final
        )
        db.add(nova_tentativa)
        db.commit()

        return {
            "status": "success",
            "transcript": transcript_final,
            "score": nota
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar áudio: {str(e)}")

```

---

### Passo 3: Enviar o ID da lição no Frontend (`Dashboard.jsx`)

Para que o backend saiba de qual lição é essa nota, só precisamos adicionar uma única linha no seu frontend.

Abra o **`src/pages/Dashboard.jsx`**, procure pela função `enviarAudioParaOBackend` e adicione o `lesson_id` no `formData`:

**Como deve ficar a função:**

```javascript
const enviarAudioParaOBackend = async (audioBlob) => {
  if (!currentLesson) return;
  setIsLoading(true);
  try {
    const formData = new FormData();
    // NOVO: Manda o ID da lição para o backend poder registrar no banco
    formData.append("lesson_id", currentLesson.id);
    formData.append("phrase", currentLesson.phrase);
    formData.append("file", audioBlob, "voice.webm");

    const response = await fetch("http://localhost:8000/api/analyze-voice", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Erro ao analisar a voz.");
    }

    setTranscript(data.transcript);
    setScore(data.score);
  } catch (error) {
    alert(error.message);
  } finally {
    setIsLoading(false);
  }
};
```

Feito isso, o seu aplicativo já estará guardando todo o histórico em silêncio no banco de dados! Toda vez que a tela mostrar a pontuação, você tem a garantia de que ela foi registrada na tabela `attempts` com a data e a hora exatas.
