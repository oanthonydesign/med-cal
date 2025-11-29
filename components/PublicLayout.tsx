import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Stethoscope, LockKeyhole } from 'lucide-react';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-600">
            <Stethoscope className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight text-slate-800">MedScheduler Pro</span>
          </div>
          <div className="text-sm text-slate-500">
            Agendamento Online
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
      <footer className="bg-slate-900 text-slate-400 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm gap-4">
          <div>
            &copy; {new Date().getFullYear()} MedScheduler Pro. Todos os direitos reservados.
          </div>
          <Link to="/login" className="flex items-center gap-2 hover:text-teal-400 transition-colors opacity-60 hover:opacity-100">
            <LockKeyhole size={14} /> Acesso Médico
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;