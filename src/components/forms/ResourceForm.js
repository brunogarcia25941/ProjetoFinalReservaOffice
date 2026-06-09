import React from 'react';

function ResourceForm({ resource, onSubmit, onChange, picklists, isEdit = false }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
        <input 
          type="text" 
          value={resource.name} 
          placeholder="Ex: Mesa B02" 
          className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
          required
          onChange={(e) => onChange({ ...resource, name: e.target.value })} 
        />
      </div>

      {!isEdit ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={resource.type}
              onChange={(e) => onChange({ ...resource, type: e.target.value })}
            >
              {picklists?.resourceTypes?.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{tipo.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Piso</label>
            <input 
              type="number" 
              placeholder="Piso" 
              value={resource.floor}
              className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              required
              onChange={(e) => onChange({ ...resource, floor: e.target.value })} 
            />
          </div>
        </>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={resource.status}
            className="w-full border border-gray-300 p-3 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => onChange({ ...resource, status: e.target.value })}
          >
            {picklists?.resourceStatuses?.map(status => (
              <option key={status.id} value={status.id}>{status.label}</option>
            ))}
          </select>
        </div>
      )}

      <button 
        type="submit" 
        className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-hover shadow-lg shadow-primary-light transition-all active:scale-95 mt-2"
      >
        {isEdit ? "Salvar Alterações" : "Criar Recurso"}
      </button>
    </form>
  );
}

export default ResourceForm;
