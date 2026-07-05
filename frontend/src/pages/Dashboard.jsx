import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square, RefreshCcw, LogOut, Award, Volume2 } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Referências para controlar o microfone nativo
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const targetPhrase = "The quick brown fox jumps over the lazy dog";

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Função para ligar o microfone e começar a gravar
  const startRecording = async () => {
    setTranscript('');
    setScore(null);
    audioChunksRef.current = [];

    try {
      // Pede permissão para usar o microfone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Vai juntando os pedacinhos de áudio gravados
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Quando a gravação parar, envia o arquivo para o backend
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await enviarAudioParaOBackend(audioBlob);
        
        // Desliga o microfone fisicamente (apaga a luzinha de gravação do PC)
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Por favor, permita o acesso ao microfone para praticar.");
      console.error(err);
    }
  };

  // Função para parar a gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Envia o arquivo real gerado para a nossa API FastAPI
  const enviarAudioParaOBackend = async (audioBlob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('phrase', targetPhrase);
      // Cria um arquivo fictício 'voice.webm' com os dados do blob do microfone
      formData.append('file', audioBlob, 'voice.webm');

      const response = await fetch('http://localhost:8000/api/analyze-voice', {
        method: 'POST',
        body: formData, // FormData define automaticamente os headers corretos de arquivos
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao analisar a voz.');
      }

      setTranscript(data.transcript);
      setScore(data.score);

    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 text-slate-100 flex flex-col items-center">
      <header className="w-full max-w-3xl flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <Mic size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Shadow Speak</h1>
        </div>
        <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 flex items-center gap-2 text-sm font-medium transition-colors">
          <LogOut size={18} /> Sair
        </button>
      </header>

      <main className="w-full max-w-3xl bg-slate-800/50 border border-slate-700 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center mb-8">
          <h2 className="text-sm font-semibold text-indigo-400 tracking-widest uppercase mb-4">Frase do dia</h2>
          <p className="text-3xl font-medium text-white leading-relaxed flex justify-center items-baseline gap-3">
            "{targetPhrase}"
            <button className="text-slate-500 hover:text-cyan-400 transition-colors">
              <Volume2 size={24} />
            </button>
          </p>
        </div>

        {/* Botão de Gravação Real */}
        <div className="flex justify-center mb-10">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl disabled:opacity-50 ${
              isRecording 
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/40 animate-pulse' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/40'
            }`}
          >
            {isLoading ? (
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : isRecording ? (
              <Square size={32} className="text-white" />
            ) : (
              <Mic size={36} className="text-white" />
            )}
          </button>
        </div>

        {/* Resultados vindo diretamente do Servidor */}
        <div className={`transition-all duration-500 overflow-hidden ${transcript ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'}`}>
          <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 w-full">
              <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">O servidor ouviu:</h3>
              <p className="text-lg text-slate-300 italic">
                "{transcript}"
              </p>
            </div>

            {score !== null && (
              <div className="flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900/40 to-slate-900/40 rounded-2xl p-6 border border-indigo-500/20 min-w-[160px]">
                <Award size={28} className="text-cyan-400 mb-2" />
                <span className="text-4xl font-bold text-white mb-1">{score}%</span>
                <span className="text-xs font-medium text-indigo-300 uppercase">Precisão</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <button 
              onClick={() => { setTranscript(''); setScore(null); }}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800"
            >
              <RefreshCcw size={16} /> Limpar e tentar de novo
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}