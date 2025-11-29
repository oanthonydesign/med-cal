import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../services/database';
import { Appointment, AppointmentStatus } from '../../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ManagePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const all = db.getAppointments();
    const appt = all.find(a => a.managementToken === token);
    if (appt) setAppointment(appt);
  }, [token]);

  const handleCancel = () => {
    if (!appointment) return;
    if (confirm("Tem certeza que deseja cancelar esta consulta?")) {
        const updated = { ...appointment, status: AppointmentStatus.CANCELED };
        db.updateAppointment(updated);
        setAppointment(updated);
        alert("Consulta cancelada com sucesso.");
    }
  };

  if (!appointment) return <div className="text-center p-10">Agendamento não encontrado.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Gerenciar Agendamento</h1>
        
        <div className="bg-slate-50 p-6 rounded-lg mb-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-slate-500 uppercase font-bold">Status</label>
                    <p className={`font-medium ${
                        appointment.status === AppointmentStatus.CONFIRMED ? 'text-green-600' :
                        appointment.status === AppointmentStatus.PENDING ? 'text-yellow-600' :
                        'text-red-600'
                    }`}>
                        {appointment.status}
                    </p>
                </div>
                <div>
                    <label className="text-xs text-slate-500 uppercase font-bold">Data</label>
                    <p className="text-slate-900 font-medium">
                        {format(parseISO(appointment.start), "dd/MM/yyyy HH:mm")}
                    </p>
                </div>
            </div>
        </div>

        {appointment.status !== AppointmentStatus.CANCELED && 
         appointment.status !== AppointmentStatus.MISSED && (
            <div className="flex gap-4">
                <button 
                    onClick={handleCancel}
                    className="flex-1 bg-red-50 text-red-700 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors"
                >
                    Cancelar Agendamento
                </button>
                <button 
                    onClick={() => {
                        // Logic to delete old and redirect to booking would go here
                        // For MVP, we just alert
                        alert("Para reagendar, cancele este horário e faça um novo agendamento.");
                    }}
                    className="flex-1 border border-slate-300 text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                    Reagendar
                </button>
            </div>
        )}
    </div>
  );
};

export default ManagePage;
