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

  const typesWithFeatures = [
    'room', 'desk', 'monitor', 'mouse', 'keyboard', 
    'headphones', 'webcam', 'hdmi_cable', 'network_cable', 
    'hdmi_vga_adapter', 'pc_charger'
  ];
  const hasFeatures = typesWithFeatures.includes(resourceType);
  const isMapResource = ['desk', 'room', 'monitor'].includes(resourceType);

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
      {hasFeatures && (
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
                  { key: 'whiteboard', label: 'Quadro Branco' },
                  { key: 'accessible', label: 'Acessibilidade (♿ PMR)' }
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
                { key: 'dual_monitor', label: 'Monitor Duplo' },
                { key: 'accessible', label: 'Acessibilidade (♿ PMR)' }
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

          {(resourceType === 'mouse' || resourceType === 'keyboard') && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              {[
                { key: 'wireless', label: 'Sem Fios' },
                { key: 'ergonomic', label: 'Ergonómico' }
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

          {resourceType === 'headphones' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              {[
                { key: 'wireless', label: 'Sem Fios' },
                { key: 'noise_cancelling', label: 'Cancelamento de Ruído' },
                { key: 'microphone', label: 'Microfone Integrado' }
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

          {resourceType === 'webcam' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Resolução (Ex: 1080p, 4K)</label>
                <input 
                  type="text" 
                  value={features.resolution || ''} 
                  onChange={(e) => handleFeatureChange('resolution', e.target.value)}
                  placeholder="Ex: 1080p"
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  <input 
                    type="checkbox" 
                    checked={!!features.built_in_mic} 
                    onChange={(e) => handleFeatureChange('built_in_mic', e.target.checked)}
                    className="rounded text-blue-500 focus:ring-blue-400 w-4 h-4 border-gray-300"
                  />
                  Microfone Integrado
                </label>
              </div>
            </div>
          )}

          {(resourceType === 'hdmi_cable' || resourceType === 'network_cable') && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Comprimento (Ex: 1.5m, 3m)</label>
              <input 
                type="text" 
                value={features.length || ''} 
                onChange={(e) => handleFeatureChange('length', e.target.value)}
                placeholder="Ex: 1.5m"
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          {resourceType === 'hdmi_vga_adapter' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Tipo de Conector / Portas</label>
              <input 
                type="text" 
                value={features.connector_type || ''} 
                onChange={(e) => handleFeatureChange('connector_type', e.target.value)}
                placeholder="Ex: HDMI para VGA"
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          {resourceType === 'pc_charger' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Potência (Ex: 65W, 90W)</label>
                <input 
                  type="text" 
                  value={features.power || ''} 
                  onChange={(e) => handleFeatureChange('power', e.target.value)}
                  placeholder="Ex: 65W"
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  <input 
                    type="checkbox" 
                    checked={!!features.usb_c} 
                    onChange={(e) => handleFeatureChange('usb_c', e.target.checked)}
                    className="rounded text-blue-500 focus:ring-blue-400 w-4 h-4 border-gray-300"
                  />
                  Conector USB-C
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dimensões Físicas para o Mapa */}
      {isMapResource && (
        <div className="border-t border-gray-150 pt-4 mt-4 space-y-3">
          <h4 className="text-sm font-bold text-gray-800">Dimensões Físicas (para o Mapa)</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Largura (metros)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={features.width_m || ''}
                placeholder={resourceType === 'room' ? '3.0' : resourceType === 'monitor' ? '0.6' : '1.2'}
                onChange={(e) => handleFeatureChange('width_m', parseFloat(e.target.value) || '')}
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Comprimento/Profundidade (metros)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={features.height_m || ''}
                placeholder={resourceType === 'room' ? '2.0' : resourceType === 'monitor' ? '0.4' : '0.8'}
                onChange={(e) => handleFeatureChange('height_m', parseFloat(e.target.value) || '')}
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              />
            </div>
          </div>
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
