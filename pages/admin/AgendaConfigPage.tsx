import React, { useEffect, useState } from 'react';
import { db } from '../../services/database';
import { ConfigAgenda } from '../../types';
import { Save } from 'lucide-react';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const AgendaConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<ConfigAgenda[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setConfigs(db.getConfig());
  }, []);

  const handleSave = () => {
    db.saveConfig(configs);
    setMsg('Configurações salvas com sucesso!');
    setTimeout(() => setMsg(''), 3000);
  };

  const updateConfig = (index: number, field: keyof ConfigAgenda, value: any) => {
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setConfigs(newConfigs);
  };

  const toggleActive = (index: number) => {
    updateConfig(index, 'active', !configs[index].active);
  };

  return (
    <div className="max-w-4xl">
         <div className="mb-6 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Configuração de Agenda</h1>
                <p className="text-slate-500">Defina os horários de atendimento padrão.</p>
            </div>
            <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
                <Save size={18} /> Salvar Alterações
            </button>
        </div>

        {msg && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">{msg}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="grid gap-4 p-6">
                {configs.sort((a,b) => a.dayOfWeek - b.dayOfWeek).map((config, idx) => (
                    <div key={config.id} className={`p-4 rounded-lg border ${config.active ? 'border-teal-200 bg-teal-50/30' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="w-32">
                                <span className="font-bold text-slate-700">{DAYS[config.dayOfWeek]}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-500 uppercase">Início</label>
                                <input 
                                    type="time" 
                                    value={config.startTime}
                                    onChange={(e) => updateConfig(idx, 'startTime', e.target.value)}
                                    className="border border-slate-300 rounded px-2 py-1 text-sm"
                                    disabled={!config.active}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-500 uppercase">Fim</label>
                                <input 
                                    type="time" 
                                    value={config.endTime}
                                    onChange={(e) => updateConfig(idx, 'endTime', e.target.value)}
                                    className="border border-slate-300 rounded px-2 py-1 text-sm"
                                    disabled={!config.active}
                                />
                            </div>

                             <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-500 uppercase">Duração (min)</label>
                                <input 
                                    type="number" 
                                    value={config.durationMinutes}
                                    onChange={(e) => updateConfig(idx, 'durationMinutes', parseInt(e.target.value))}
                                    className="border border-slate-300 rounded px-2 py-1 w-16 text-sm"
                                    disabled={!config.active}
                                />
                            </div>

                            <div className="ml-auto">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={config.active} 
                                        onChange={() => toggleActive(idx)}
                                        className="sr-only peer"
                                    />
                                    <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                    <span className="ms-3 text-sm font-medium text-slate-700">{config.active ? 'Ativo' : 'Inativo'}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default AgendaConfigPage;
