import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2, RefreshCcw, Award } from 'lucide-react';

export default function Stats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_attempts: 0, average_score: 0, history: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/attempts/summary');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 text-slate-100 flex flex-col items-center">
      
      <header className="w-full max-w-3xl flex justify-between items-center mb-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={18} /> Voltar para o Treino
        </button>
        <div className="flex items-center gap-2 text-indigo-400 font-bold">
          <BarChart2 size={20} /> Meu Desempenho
        </div>
      </header>

      <main className="w-full max-w-3xl">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Total */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 shadow-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Sessões Praticadas</p>
                <p className="text-5xl font-extrabold text-white">{stats.total_attempts}</p>
              </div>
              <div className="w-16 h-16 bg-slate-700/40 rounded-2xl flex items-center justify-center text-slate-300">
                <RefreshCcw size={28} />
              </div>
            </div>

            {/* Card 2: Média */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 shadow-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Média de Acertos</p>
                <p className="text-5xl font-extrabold text-indigo-400">{stats.average_score}%</p>
              </div>
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <Award size={28} />
              </div>
            </div>

            {/* Lista: Histórico */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 shadow-xl md:col-span-2 mt-4">
              <h3 className="text-lg font-bold text-slate-200 mb-6 border-b border-slate-700/50 pb-4">Histórico Recente de Evolução</h3>
              
              {stats.history.length > 0 ? (
                <div className="space-y-3">
                  {stats.history.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-slate-900/50 rounded-2xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-all">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-slate-100 truncate font-medium text-base">"{item.phrase}"</p>
                        <span className="text-sm text-slate-500">{item.date}</span>
                      </div>
                      <span className={`font-bold px-4 py-2 rounded-xl text-sm tracking-wide shadow-sm ${
                        item.score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        item.score >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {item.score}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-400">Nenhuma gravação avaliada ainda.</p>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="mt-4 text-indigo-400 hover:text-indigo-300 font-medium text-sm"
                  >
                    Ir para o treino
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}