import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, LogOut, Stethoscope, ChevronRight, Home } from 'lucide-react';
import { User } from '../types';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('med_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('med_session');
    navigate('/login');
  };

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-teal-700 text-white shadow-md border border-teal-600'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  // Helper para nomear as rotas no breadcrumb
  const getPageName = (path: string) => {
      const segment = path.split('/').pop();
      switch(segment) {
          case 'dashboard': return 'Visão Geral';
          case 'patients': return 'Meus Pacientes';
          case 'agenda': return 'Configurações de Agenda';
          default: return segment;
      }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col shadow-xl z-10 text-white">
        <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
             <div className="bg-teal-600 p-2 rounded-lg">
                <Stethoscope className="w-5 h-5 text-white" />
             </div>
             <div>
                 <h1 className="font-bold text-base leading-tight">Área Médica</h1>
                 <p className="text-[10px] text-slate-400 uppercase tracking-wider">Painel da Doutora</p>
             </div>
          </div>
        </div>
        
        <div className="p-4 space-y-1 flex-1">
          <div className="mb-6">
             <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 mt-4">Menu Principal</p>
             <nav className="space-y-2">
                <NavLink to="/admin/dashboard" className={navClass}>
                    <LayoutDashboard size={18} />
                    Visão Geral (Hoje)
                </NavLink>
                <NavLink to="/admin/patients" className={navClass}>
                    <Users size={18} />
                    Meus Pacientes
                </NavLink>
                <NavLink to="/admin/agenda" className={navClass}>
                    <Calendar size={18} />
                    Configurar Horários
                </NavLink>
             </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 px-2 py-2 mb-4 bg-slate-800 rounded-lg border border-slate-700">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold border-2 border-slate-600">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.role === 'ADMIN' ? 'Doutora Responsável' : 'Secretária'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors font-medium border border-transparent hover:border-red-500/30"
          >
            <LogOut size={16} />
            Encerrar Plantão
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white h-16 shadow-md flex items-center justify-between px-4 z-10">
            <div className="flex items-center gap-2">
                <Stethoscope size={20} className="text-teal-400" />
                <span className="font-bold text-lg">Área da Doutora</span>
            </div>
            <button onClick={handleLogout} className="text-white/80 hover:text-white"><LogOut size={20}/></button>
        </header>
        
        <main className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-100">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center text-sm text-slate-500">
                <Link to="/admin/dashboard" className="hover:text-teal-600 flex items-center gap-1 transition-colors">
                    <Home size={14}/> Início
                </Link>
                {location.pathname !== '/admin/dashboard' && (
                    <>
                        <ChevronRight size={14} className="mx-2 text-slate-300" />
                        <span className="font-medium text-slate-700 capitalize">
                            {getPageName(location.pathname)}
                        </span>
                    </>
                )}
            </div>
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;