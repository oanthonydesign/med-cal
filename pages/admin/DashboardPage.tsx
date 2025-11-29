import React, { useEffect, useState } from 'react';
import { db } from '../../services/database';
import { Appointment, Patient, AppointmentStatus } from '../../types';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, Clock, AlertCircle, Calendar as CalendarIcon, Mail, Phone, FileText, User } from 'lucide-react';

interface AppointmentWithPatient extends Appointment {
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    patientDocument?: string;
}

const DashboardPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, total: 0 });

  const loadData = () => {
    const allAppts = db.getAppointments();
    const allPatients = db.getPatients();

    // Filter by selected date
    const filteredAppts = allAppts
        .filter(a => isSameDay(parseISO(a.start), selectedDate) && a.status !== AppointmentStatus.CANCELED)
        .map(a => {
            const p = allPatients.find(pat => pat.id === a.patientId);
            return {
                ...a,
                patientName: p?.name || 'Desconhecido',
                patientPhone: p?.phone || '-',
                patientEmail: p?.email || '-',
                patientDocument: p?.document
            };
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    setAppointments(filteredAppts);

    // Stats are based on the selected day
    setStats({
        total: filteredAppts.length,
        pending: filteredAppts.filter(a => a.status === AppointmentStatus.PENDING).length,
        confirmed: filteredAppts.filter(a => a.status === AppointmentStatus.CONFIRMED).length
    });
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Auto-refresh
    return () => clearInterval(interval);
  }, [selectedDate]); // Reload when date changes

  const updateStatus = (appt: Appointment, newStatus: AppointmentStatus) => {
    if (confirm(`Deseja alterar o status para: ${newStatus}?`)) {
        db.updateAppointment({ ...appt, status: newStatus });
        loadData();
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
        case AppointmentStatus.CONFIRMED:
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">CONFIRMADA</span>;
        case AppointmentStatus.PENDING:
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">AGUARDANDO</span>;
        case AppointmentStatus.NOT_CONFIRMED:
             return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">NÃO CONFIRMADA</span>;
        case AppointmentStatus.COMPLETED:
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">FINALIZADA</span>;
        case AppointmentStatus.MISSED:
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">FALTOU</span>;
        default:
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Visão Diária da Doutora</h1>
                <p className="text-slate-500">Controle total dos agendamentos e pacientes.</p>
            </div>
            
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-300 shadow-sm focus-within:ring-2 focus-within:ring-teal-500">
                <CalendarIcon className="text-teal-600" size={20} />
                <span className="text-sm font-bold text-slate-600 mr-2">Data:</span>
                <input 
                    type="date" 
                    className="outline-none text-slate-700 font-medium bg-transparent cursor-pointer"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => {
                        if(e.target.value) setSelectedDate(parseISO(e.target.value));
                    }}
                />
            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Clock size={24}/></div>
                <div>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Total no Dia</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                 <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Check size={24}/></div>
                 <div>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Confirmados</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.confirmed}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                 <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><AlertCircle size={24}/></div>
                 <div>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Pendentes</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.pending}</p>
                </div>
            </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <CalendarIcon size={18} className="text-slate-400"/>
                    Agenda: <span className="text-teal-700">{format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                </h2>
                <button onClick={loadData} className="text-sm font-medium text-teal-600 hover:text-teal-800 hover:underline">
                    Atualizar Lista
                </button>
            </div>
            
            {appointments.length === 0 ? (
                <div className="p-16 text-center">
                    <div className="bg-slate-50 inline-block p-4 rounded-full mb-4">
                        <User className="text-slate-300 w-8 h-8" />
                    </div>
                    <p className="text-slate-500 font-medium">Nenhum paciente agendado para esta data.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 w-24 text-center">Horário</th>
                                <th className="px-6 py-4">Paciente</th>
                                <th className="px-6 py-4">Contatos (Email / Tel)</th>
                                <th className="px-6 py-4 w-1/4">Observações do Paciente</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {appointments.map(appt => (
                                <tr key={appt.id} className="hover:bg-teal-50/30 transition-colors group">
                                    <td className="px-6 py-5 text-center bg-slate-50/50">
                                        <span className="text-lg font-bold text-slate-800 block">
                                            {format(parseISO(appt.start), 'HH:mm')}
                                        </span>
                                    </td>
                                    
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg">
                                                {appt.patientName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-base">{appt.patientName}</div>
                                                {appt.patientDocument && (
                                                    <div className="text-xs text-slate-500">CPF: {appt.patientDocument}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-sm text-slate-700 bg-white px-2 py-1 rounded border border-slate-100 w-fit">
                                                <Phone size={14} className="text-teal-600"/> 
                                                <span className="font-medium">{appt.patientPhone}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-2 py-1 rounded border border-slate-100 w-fit">
                                                <Mail size={14} className="text-teal-600"/> 
                                                <span>{appt.patientEmail}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                                        {appt.notes ? (
                                            <div className="text-sm text-slate-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100 relative">
                                                <FileText size={14} className="text-yellow-500 absolute top-3 left-3" />
                                                <p className="pl-6 italic leading-snug">"{appt.notes}"</p>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-xs uppercase font-bold tracking-wide pl-2 border-l-2 border-slate-200">
                                                Sem observações
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-5 text-center">
                                        {getStatusBadge(appt.status)}
                                    </td>

                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-100 transition-opacity">
                                            {appt.status === AppointmentStatus.CONFIRMED && (
                                                <>
                                                    <button 
                                                        onClick={() => updateStatus(appt, AppointmentStatus.COMPLETED)}
                                                        className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition-colors border border-green-200 shadow-sm" 
                                                        title="Marcar como Compareceu"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => updateStatus(appt, AppointmentStatus.MISSED)}
                                                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors border border-red-200 shadow-sm" 
                                                        title="Marcar como Não Compareceu"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </>
                                            )}
                                            {appt.status === AppointmentStatus.PENDING && (
                                                <button 
                                                    onClick={() => updateStatus(appt, AppointmentStatus.CONFIRMED)}
                                                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md flex items-center gap-2 ml-auto" 
                                                >
                                                    <Check size={16} /> Confirmar
                                                </button>
                                            )}
                                             {(appt.status === AppointmentStatus.CANCELED || appt.status === AppointmentStatus.NOT_CONFIRMED) && (
                                                <span className="text-slate-400 text-xs italic">Sem ações</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
  );
};

export default DashboardPage;