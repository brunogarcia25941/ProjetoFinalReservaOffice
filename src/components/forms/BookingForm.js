import React from 'react';
import GuestInput from './GuestInput';

function BookingForm({ booking, resources, onSubmit, onChange, onCancel }) {
  const selectedResource = resources.find(r => String(r.id) === String(booking.resource_id));
  const isRoom = selectedResource && selectedResource.type === 'room';
  const isDesk = selectedResource && selectedResource.type === 'desk';

  const guestEmails = (booking.guests || []).map(g => typeof g === 'string' ? g : g.email);
  const monitors = resources.filter(r => 
    r.type === 'monitor' && 
    r.status === 'active' &&
    (selectedResource ? r.building === selectedResource.building : true)
  );

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

      {isRoom && (
        <div className="pt-2 border-t border-gray-100">
          <GuestInput 
            guests={guestEmails}
            onChange={(newEmails) => onChange({ ...booking, guests: newEmails })}
          />
        </div>
      )}

      {isDesk && (
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Monitor Extra Móvel (Opcional)</label>
          <select 
            value={booking.extra_resource_id || ''}
            onChange={(e) => onChange({...booking, extra_resource_id: e.target.value ? parseInt(e.target.value) : null})}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">-- Sem Monitor Extra --</option>
            {monitors.map(m => {
              let sizeText = '';
              if (m.features) {
                const features = typeof m.features === 'string' ? JSON.parse(m.features) : m.features;
                if (features.size) sizeText = ` (${features.size})`;
              }
              return (
                <option key={m.id} value={m.id}>{m.name}{sizeText}</option>
              );
            })}
          </select>
        </div>
      )}

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
