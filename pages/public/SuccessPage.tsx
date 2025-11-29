import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SuccessPage: React.FC = () => {
  const { state } = useLocation();
  
  if (!state || !state.appointment) {
    return (
        <div className="text-center py-20">
            <h2 className="text-xl font-bold text-slate-700">Acesso Inválido</h2>
            <Link to="/" className="text-teal-600 mt-4 inline-block">Voltar para o início</Link>
        </div>
    );
  }

  const { appointment } = state;
  const start = parseISO(appointment.start);
  const deadline = parseISO(appointment.confirmationDeadline);

  // Simulation links for the demo
  const confirmLink = `/confirm/${appointment.confirmationToken}`;
  const manageLink = `/manage/${appointment.managementToken}`;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg text-center">
        <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="text-green-600 w-12 h-12" />
            </div>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Solicitação Recebida!</h1>
        <p className="text-slate-600 mb-8">
            Seu horário está reservado temporariamente.
        </p>

        <div className="bg-slate-50 p-6 rounded-lg text-left mb-8 border border-slate-200">
            <h3 className="font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">Detalhes do Agendamento</h3>
            <div className="space-y-2 text-sm text-slate-700">
                <p><span className="font-medium text-slate-900">Data:</span> {format(start, "eeee, d 'de' MMMM", { locale: ptBR })}</p>
                <p><span className="font-medium text-slate-900">Horário:</span> {format(start, "HH:mm")}</p>
                <p><span className="font-medium text-slate-900">Prazo de Confirmação:</span> {format(deadline, "dd/MM 'às' HH:mm")}</p>
            </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 text-left text-sm text-yellow-800">
            <p className="font-bold mb-1">Ação Necessária</p>
            <p>
                Enviamos um e-mail para confirmar. Por favor, confirme antes do prazo limite para evitar o cancelamento automático.
            </p>
        </div>

        {/* DEMO PURPOSES ONLY - In a real app this would be in an email */}
        <div className="border-t pt-8 mt-8">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-4">Área de Demonstração (Simulando E-mail)</p>
            <div className="flex flex-col gap-3">
                <Link to={confirmLink} className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-lg font-medium">
                    Simular "Link de Confirmação" <ExternalLink size={16}/>
                </Link>
                 <Link to={manageLink} className="flex items-center justify-center gap-2 w-full border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-lg font-medium">
                    Simular "Gerenciar Agendamento" <ExternalLink size={16}/>
                </Link>
            </div>
        </div>
    </div>
  );
};

export default SuccessPage;
