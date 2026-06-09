import React from 'react';

function OfficeForm({ office, onSubmit, onChange, isEdit = false }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Escritório</label>
        <input 
          type="text" 
          value={office.name} 
          placeholder="Ex: Softinsa Tomar, Porto Office" 
          className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
          required
          onChange={(e) => onChange({ ...office, name: e.target.value })} 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Morada</label>
        <input 
          type="text" 
          value={office.address || ''} 
          placeholder="Ex: Rua de Coimbra, nº 45" 
          className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
          onChange={(e) => onChange({ ...office, address: e.target.value })} 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Abertura</label>
          <input 
            type="text" 
            placeholder="09:00:00"
            value={office.operating_hours_start} 
            className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            required
            onChange={(e) => onChange({ ...office, operating_hours_start: e.target.value })} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Encerramento</label>
          <input 
            type="text" 
            placeholder="18:00:00"
            value={office.operating_hours_end} 
            className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            required
            onChange={(e) => onChange({ ...office, operating_hours_end: e.target.value })} 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fuso Horário</label>
        <select
          value={office.timezone}
          className="w-full border border-gray-300 p-3 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => onChange({ ...office, timezone: e.target.value })}
        >
          <option value="Europe/Lisbon">Europe/Lisbon (WET/WEST)</option>
          <option value="Europe/London">Europe/London (GMT/BST)</option>
          <option value="America/New_York">America/New_York (EST/EDT)</option>
        </select>
      </div>

      {isEdit && (
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="active-office"
            checked={!!office.active} 
            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            onChange={(e) => onChange({ ...office, active: e.target.checked })} 
          />
          <label htmlFor="active-office" className="text-sm font-medium text-gray-700">Escritório Ativo</label>
        </div>
      )}

      <button 
        type="submit" 
        className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-hover shadow-lg shadow-primary-light transition-all active:scale-95 mt-2"
      >
        {isEdit ? "Salvar Alterações" : "Criar Escritório"}
      </button>
    </form>
  );
}

export default OfficeForm;
