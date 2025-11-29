import React, { useEffect, useState } from 'react';
import { db } from '../../services/database';
import { Patient } from '../../types';
import { Search } from 'lucide-react';

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setPatients(db.getPatients());
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Pacientes</h1>
            <p className="text-slate-500">Histórico de pacientes cadastrados.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-200">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nome ou e-mail..." 
                        className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-3">Nome</th>
                        <th className="px-6 py-3">E-mail</th>
                        <th className="px-6 py-3">Telefone</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredPatients.map(patient => (
                        <tr key={patient.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900">{patient.name}</td>
                            <td className="px-6 py-4 text-slate-600">{patient.email}</td>
                            <td className="px-6 py-4 text-slate-600">{patient.phone}</td>
                        </tr>
                    ))}
                    {filteredPatients.length === 0 && (
                        <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                Nenhum paciente encontrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default PatientsPage;
