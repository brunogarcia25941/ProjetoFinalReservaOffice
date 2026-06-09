import React from 'react';

function ResourceForm({ resource, onSubmit, onChange, picklists, isEdit = false }) {
  // Obter o tipo de recurso como string (room, desk, monitor)
  const getResourceTypeName = () => {
    if (!resource.type) return '';
    const foundType = picklists?.resourceTypes?.find(t => String(t.id) === String(resource.type));
    return foundType ? foundType.id : resource.type;
  };

  const resourceType = getResourceTypeName();
  const features = resource.features || {};

  const handleFeatureChange = (key, value) => {
    onChange({
      ...resource,
      features: {
        ...features,
        [key]: value
      }
    });
  };

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
              className="w-full border border-gray-300 p-3 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={resource.type}
              onChange={(e) => onChange({ ...resource, type: e.target.value, features: {} })}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Edifício / Escritório</label>
            <input 
              type="text" 
              placeholder="Ex: Edifício Principal, Lisboa, Porto" 
              value={resource.building || ''}
              className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              required
              onChange={(e) => onChange({ ...resource, building: e.target.value })} 
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

      {/* Características do Recurso */}
      <div className="border-t border-gray-150 pt-4 mt-4 space-y-3">
        <h4 className="text-sm font-bold text-gray-800">Características</h4>
        
        {resourceType === 'room' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Capacidade (Nº de Pessoas)</label>
              <input 
                type="number" 
                value={features.capacity || ''} 
                onChange={(e) => handleFeatureChange('capacity', parseInt(e.target.value) || '')}
                placeholder="Ex: 8"
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              {[
                { key: 'wifi', label: 'Wi-Fi' },
                { key: 'projector', label: 'Projetor' },
                { key: 'tv', label: 'Televisor/Ecrã' },
                { key: 'whiteboard', label: 'Quadro Branco' }
              ].map(f => (
                <label key={f.key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  <input 
                    type="checkbox" 
                    checked={!!features[f.key]} 
                    onChange={(e) => handleFeatureChange(f.key, e.target.checked)}
                    className="rounded text-blue-500 focus:ring-blue-400 w-4 h-4 border-gray-300"
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {resourceType === 'desk' && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            {[
              { key: 'standing_desk', label: 'Standing Desk' },
              { key: 'window_seat', label: 'Junto à Janela' },
              { key: 'dual_monitor', label: 'Monitor Duplo' }
            ].map(f => (
              <label key={f.key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                <input 
                  type="checkbox" 
                  checked={!!features[f.key]} 
                  onChange={(e) => handleFeatureChange(f.key, e.target.checked)}
                  className="rounded text-blue-500 focus:ring-blue-400 w-4 h-4 border-gray-300"
                />
                {f.label}
              </label>
            ))}
          </div>
        )}

        {resourceType === 'monitor' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tamanho (Pol.)</label>
                <input 
                  type="text" 
                  value={features.size || ''} 
                  onChange={(e) => handleFeatureChange('size', e.target.value)}
                  placeholder="Ex: 27\"
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Resolução</label>
                <input 
                  type="text" 
                  value={features.resolution || ''} 
                  onChange={(e) => handleFeatureChange('resolution', e.target.value)}
                  placeholder="Ex: 4K, 1080p"
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                <input 
                  type="checkbox" 
                  checked={!!features.usb_c} 
                  onChange={(e) => handleFeatureChange('usb_c', e.target.checked)}
                  className="rounded text-blue-500 focus:ring-blue-400 w-4 h-4 border-gray-300"
                />
                Conexão USB-C (Carregamento)
              </label>
            </div>
          </div>
        )}

        {!resourceType && (
          <p className="text-xs text-gray-400 italic">Seleciona um tipo de recurso para ver as suas características.</p>
        )}
      </div>

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
