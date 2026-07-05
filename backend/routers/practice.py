from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import speech_recognition as sr
from pydub import AudioSegment
import io

router = APIRouter(prefix="/api", tags=["Prática de Voz"])

def calcular_porcentagem_acerto(frase_original: str, frase_dita: str) -> int:
    # Transforma em minúsculo e limpa pontuações básicas para comparar melhor
    orig = "".join(c for c in frase_original.lower() if c.isalnum() or c.isspace()).split()
    dita = "".join(c for c in frase_dita.lower() if c.isalnum() or c.isspace()).split()
    
    if not orig:
        return 0
        
    # Conta quantas palavras da frase original o usuário acertou na ordem/posição correta
    acertos = 0
    for i, palavra in enumerate(orig):
        if i < len(dita) and palavra == dita[i]:
            acertos += 1
            
    porcentagem = int((acertos / len(orig)) * 100)
    return porcentagem

@router.post("/analyze-voice")
async def analyze_voice(
    phrase: str = Form(...), 
    file: UploadFile = File(...)
):
    try:
        # 1. Ler os bytes do arquivo enviado pelo Frontend
        audio_bytes = await file.read()
        
        # 2. O navegador costuma gravar em WebM/Ogg. Precisamos converter para WAV para o SpeechRecognition entender
        audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes))
        wav_io = io.BytesIO()
        audio_segment.export(wav_io, format="wav")
        wav_io.seek(0)
        
        # 3. Inicializar o reconhecedor de voz
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_io) as source:
            audio_data = recognizer.record(source)
            
        # 4. Transformar áudio em texto (usando a engine gratuita do Google em inglês)
        # Nota: Como o app é para treinar inglês, passamos language="en-US"
        try:
            texto_transcrito = recognizer.recognize_google(audio_data, language="en-US")
        except sr.UnknownValueError:
            texto_transcrito = "" # Não entendeu nada do que foi falado
        except sr.RequestError:
            raise HTTPException(status_code=503, detail="Serviço de reconhecimento indisponível")

        # 5. Calcular a nota de acerto
        nota = calcular_porcentagem_acerto(phrase, texto_transcrito)
        
        return {
            "status": "success",
            "transcript": texto_transcrito if texto_transcrito else "(Áudio não compreendido)",
            "score": nota
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar áudio: {str(e)}")