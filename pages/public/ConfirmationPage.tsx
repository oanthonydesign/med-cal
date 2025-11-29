import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../services/database';
import { Appointment, AppointmentStatus } from '../../types';
import { isBefore, parseISO } from 'date-fns';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const ConfirmationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'EXPIRED' | 'NOT_FOUND' | 'ALREADY_CONFIRMED'>('LOADING');
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (!token) return;

    const allAppointments = db.getAppointments();
    const appt = allAppointments.find(a => a.confirmationToken === token);

    if (!appt) {
      setStatus('NOT_FOUND');
      return;
    }

    setAppointment(appt);

    // If already confirmed
    if (appt.status === AppointmentStatus.CONFIRMED) {
        setStatus('ALREADY_CONFIRMED');
        return;
    }

    // Check expiration
    const deadline = parseISO(appt.confirmationDeadline);
    const now = new Date();

    if (isBefore(deadline, now)) {
      setStatus('EXPIRED');
      // Update status to not confirmed if still pending
      if (appt.status === AppointmentStatus.PENDING) {
        const updated = { ...appt, status: AppointmentStatus.NOT_CONFIRMED };
        db.updateAppointment(updated);
      }
      return;
    }

    // Confirm it
    if (appt.status === AppointmentStatus.PENDING) {
        const updated = { ...appt, status: AppointmentStatus.CONFIRMED };
        db.updateAppointment(updated);
        setAppointment(updated);
        setStatus('SUCCESS');
    } else {
        setStatus('ALREADY_CONFIRMED'); // Or cancelled
    }

  }, [token]);

  if (status === 'LOADING') {
    return <div className="text-center py-20 text-slate-500">Validando confirmação...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10">
        {status === 'SUCCESS' && (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center border-t-4 border-green-500">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-slate-800">Consulta Confirmada!</h1>
                <p className="text-slate-600 mt-2">
                    Obrigado. Sua presença está confirmada para o horário agendado.
                </p>
            </div>
        )}

        {status === 'ALREADY_CONFIRMED' && (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center border-t-4 border-blue-500">
                <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-slate-800">Já Confirmada</h1>
                <p className="text-slate-600 mt-2">
                    Esta consulta já foi confirmada anteriormente.
                </p>
            </div>
        )}

        {status === 'EXPIRED' && (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center border-t-4 border-red-500">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-slate-800">Prazo Expirado</h1>
                <p className="text-slate-600 mt-2">
                    Infelizmente o prazo para confirmação (48h antes) expirou.
                </p>
                <div className="mt-6">
                    <Link to="/" className="text-teal-600 font-medium hover:underline">Agendar novo horário</Link>
                </div>
            </div>
        )}

        {status === 'NOT_FOUND' && (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center border-t-4 border-slate-500">
                <AlertTriangle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-slate-800">Não Encontrado</h1>
                <p className="text-slate-600 mt-2">
                    Link de confirmação inválido ou a consulta foi removida.
                </p>
            </div>
        )}
    </div>
  );
};

export default ConfirmationPage;
