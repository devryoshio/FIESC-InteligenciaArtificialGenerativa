import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simula uma requisição para a API de 1.5 segundos antes de ir para o Dashboard
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efeitos de fundo (Gradients) */}
      <div className="absolute top-[-10%] right-[-10%] w-96 height-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 height-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 z-10 transition-all">
        
        {/* Logo Combinada: Perfil/Microfone + Ondas */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-4 animate-pulse">
            <Mic size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Shadow Speak</h1>
          <p className="text-sm text-slate-500 mt-1">A voz da sua fluência</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Campo Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-mail</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800"
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-slate-700">Senha</label>
              <a href="#" className="text-xs font-medium text-indigo-600 hover:underline">Esqueceu a senha?</a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800"
              />
            </div>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Entrar <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divisor */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">OU CONTINUAR COM</span>
        </div>

        {/* Login Social Mockado */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3 border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.24 1 3.2 3.76 1.28 7.76l3.88 3C6.08 7.64 8.84 5.04 12 5.04z"/>
            <path fill="#4285F4" d="M23.52 12.32c0-.88-.08-1.72-.24-2.52H12v4.8h6.48c-.28 1.48-1.12 2.72-2.36 3.56l3.68 2.84c2.16-2 3.72-4.96 3.72-8.68z"/>
            <path fill="#FBBC05" d="M5.16 14.24c-.24-.72-.4-1.48-.4-2.24s.16-1.52.4-2.24L1.28 6.76C.48 8.36 0 10.12 0 12s.48 3.64 1.28 5.24l3.88-3z"/>
            <path fill="#34A853" d="M12 23c3.24 0 5.96-1.08 7.96-2.92l-3.68-2.84c-1.04.68-2.36 1.12-4.28 1.12-3.16 0-5.92-2.6-6.88-5.72l-3.88 3C3.2 20.24 7.24 23 12 23z"/>
          </svg>
          Google
        </button>



              {/* Link para Cadastro */}
        <p className="text-center text-sm text-slate-600 mt-6">
          Ainda não tem conta?{' '}
          <span 
            onClick={() => navigate('/register')} 
            className="font-semibold text-indigo-600 hover:underline cursor-pointer"
          >
            Cadastre-se
          </span>
        </p>

      </div>

  


    </div>
  );
}