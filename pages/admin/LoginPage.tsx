import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/database';
import { Lock, Stethoscope, Activity } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = db.getUsers();
    // Simplified login logic
    const user = users.find(u => u.email === email);
    
    if (user) {
        localStorage.setItem('med_session', JSON.stringify(user));
        navigate('/admin/dashboard');
    } else {
        setError('Acesso negado. Credenciais inválidas.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-sm border-t-4 border-teal-600">
            <div className="flex justify-center mb-6">
                <div className="bg-teal-50 p-4 rounded-full border border-teal-100">
                    <Activity className="text-teal-600 w-8 h-8" />
                </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-slate-800 mb-1">Portal da Doutora</h1>
            <p className="text-center text-slate-500 mb-8 text-sm">Identifique-se para acessar a agenda.</p>

            <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                    <div className="text-red-600 text-xs font-medium text-center bg-red-50 p-3 rounded-lg border border-red-100 flex items-center justify-center gap-2">
                         <Lock size={14}/> {error}
                    </div>
                )}
                <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Login (E-mail)</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all"
                        placeholder="doutora@clinica.com"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Senha</label>
                    <input 
                        type="password" 
                        className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all"
                        placeholder="••••••"
                    />
                </div>
                <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition shadow-md hover:shadow-lg transform active:scale-95 flex justify-center items-center gap-2">
                    <Stethoscope size={18} /> Entrar no Sistema
                </button>
            </form>
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">Sistema Seguro • MedScheduler Pro</p>
                <div className="mt-2 text-[10px] text-slate-300 bg-slate-50 py-1 px-2 rounded inline-block border border-slate-100">
                    Login Demo: <strong>admin@med.com</strong>
                </div>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;