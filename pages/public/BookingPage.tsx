import React, { useState, useEffect } from 'react';
import { format, isSameDay, addHours, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { db } from '../../services/database';
import { Slot, Patient, AppointmentStatus } from '../../types';
import { Calendar as CalendarIcon, Clock, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  useEffect(() => {
    // Load available slots
    const availableSlots = db.generateSlots(21); // Next 3 weeks
    setSlots(availableSlots);
    if(availableSlots.length > 0) {
        setSelectedDate(parseISO(availableSlots[0].start));
    }
  }, []);

  const uniqueDays = Array.from(new Set(slots.map(s => format(parseISO(s.start), 'yyyy-MM-dd'))))
    .map(dateStr => parseISO(dateStr));

  const slotsForSelectedDate = selectedDate 
    ? slots.filter(s => isSameDay(parseISO(s.start), selectedDate))
    : [];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setLoading(true);

    try {
        // 1. Find or Create Patient
        let patient = db.findPatientByEmail(formData.email);
        if (!patient) {
            patient = {
                id: `pat_${Date.now()}`,
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            };
            db.createPatient(patient);
        }

        // 2. Create Appointment
        const doctor = db.getDoctor();
        const start = parseISO(selectedSlot.start);
        const deadline = addHours(start, -doctor.confirmationDeadlineHours);
        
        const confirmationToken = Math.random().toString(36).substring(2, 15);
        const managementToken = Math.random().toString(36).substring(2, 15);

        const appointment = {
            id: `appt_${Date.now()}`,
            doctorId: doctor.id,
            patientId: patient.id,
            slotId: selectedSlot.id,
            start: selectedSlot.start,
            end: selectedSlot.end,
            status: AppointmentStatus.PENDING,
            confirmationDeadline: deadline.toISOString(),
            confirmationToken,
            managementToken,
            notes: formData.notes,
            createdAt: new Date().toISOString()
        };

        db.saveAppointment(appointment);
        
        // Navigate to success/info page
        navigate('/success', { 
            state: { 
                appointment, 
                deadlineHours: doctor.confirmationDeadlineHours 
            } 
        });

    } catch (err) {
        console.error(err);
        alert("Erro ao agendar. Tente novamente.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
        <div className="bg-teal-600 p-6 text-white">
            <h1 className="text-2xl font-bold">Agende sua Consulta</h1>
            <p className="text-teal-100 mt-1">Selecione um horário e preencha seus dados.</p>
        </div>

        <div className="p-6 md:p-8">
            {step === 1 && (
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Date Selection */}
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <CalendarIcon size={20} className="text-teal-600"/> 1. Escolha o dia
                        </h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {uniqueDays.map((date) => (
                                <button
                                    key={date.toISOString()}
                                    onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                                        selectedDate && isSameDay(selectedDate, date)
                                            ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500'
                                            : 'border-slate-200 hover:border-teal-300'
                                    }`}
                                >
                                    <div className="font-medium text-slate-900 capitalize">
                                        {format(date, 'EEEE, d', { locale: ptBR })} de {format(date, 'MMMM', { locale: ptBR })}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {slots.filter(s => isSameDay(parseISO(s.start), date)).length} horários disponíveis
                                    </div>
                                </button>
                            ))}
                            {uniqueDays.length === 0 && (
                                <div className="text-slate-500 italic p-4 text-center bg-slate-50 rounded">
                                    Nenhum horário disponível para os próximos dias.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Time Selection */}
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Clock size={20} className="text-teal-600"/> 2. Escolha o horário
                        </h2>
                        
                        {!selectedDate ? (
                             <div className="text-slate-400 text-sm p-4 border border-dashed rounded-lg text-center">
                                Selecione uma data primeiro
                             </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {slotsForSelectedDate.map(slot => (
                                    <button
                                        key={slot.id}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`py-2 px-3 text-sm font-medium rounded-md border transition-colors ${
                                            selectedSlot?.id === slot.id
                                                ? 'bg-teal-600 text-white border-teal-600'
                                                : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:text-teal-700'
                                        }`}
                                    >
                                        {format(parseISO(slot.start), 'HH:mm')}
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedSlot && (
                            <div className="mt-8 p-4 bg-teal-50 rounded-lg border border-teal-100">
                                <h3 className="font-semibold text-teal-800 mb-2">Resumo:</h3>
                                <p className="text-sm text-teal-700">
                                    {format(parseISO(selectedSlot.start), "eeee, d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                </p>
                                <button 
                                    onClick={() => setStep(2)}
                                    className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    Continuar <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="max-w-lg mx-auto">
                    <button 
                        onClick={() => setStep(1)} 
                        className="mb-6 text-sm text-slate-500 hover:text-teal-600 flex items-center gap-1"
                    >
                        ← Voltar para seleção
                    </button>
                    
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Seus Dados</h2>
                    <form onSubmit={handleBooking} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                            <input 
                                required
                                type="text" 
                                className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                                <input 
                                    required
                                    type="email" 
                                    className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp / Telefone</label>
                                <input 
                                    required
                                    type="tel" 
                                    className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Motivo / Observações (Opcional)</label>
                            <textarea 
                                className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent h-24"
                                value={formData.notes}
                                onChange={e => setFormData({...formData, notes: e.target.value})}
                            ></textarea>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex gap-3 text-sm text-yellow-800 mt-4">
                            <AlertCircle className="flex-shrink-0" size={20} />
                            <p>
                                Importante: Você receberá um link por e-mail/WhatsApp. É necessário <strong>confirmar a consulta</strong> até 48 horas antes do horário, caso contrário ela será cancelada automaticamente.
                            </p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Agendando...' : 'Confirmar Agendamento'}
                        </button>
                    </form>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;