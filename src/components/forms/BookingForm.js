import React from 'react';

function BookingForm({ booking, resources, onSubmit, onChange, onCancel }) {
  return (
    <form onSubmit={onSubmit} className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Recurso</label>
        <select 
          value={booking.resource_id}
          onChange={(e) => onChange({...booking, resource_id: e.target.value})}
          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          required
        >
          {resources.map(r => (
            <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Início</label>
          <input 
            type="datetime-local" 
            value={booking.start_time}
            onChange={(e) => onChange({...booking, start_time: e.target.value})}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Fim</label>
          <input 
            type="datetime-local" 
            value={booking.end_time}
            onChange={(e) => onChange({...booking, end_time: e.target.value})}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
          />
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-colors text-sm"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-primary-light text-sm"
        >
          Guardar Alterações
        </button>
      </div>
    </form>
  );
}

export default BookingForm;
