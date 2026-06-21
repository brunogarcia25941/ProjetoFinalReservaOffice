import React, { useState } from 'react';

const translateType = (type) => {
  const mapping = {
    desk: 'Mesa',
    room: 'Sala de Reunião',
    monitor: 'Monitor',
    mouse: 'Rato',
    keyboard: 'Teclado',
    headphones: 'Auscultadores',
    hdmi_cable: 'Cabo HDMI',
    network_cable: 'Cabo de Rede',
    webcam: 'Webcam',
    hdmi_vga_adapter: 'Adaptador HDMI para VGA',
    pc_charger: 'Carregador de PC'
  };
  return mapping[type] || (type ? type.charAt(0).toUpperCase() + type.slice(1) : '');
};

const translateStatus = (status) => {
  const mapping = {
    active: 'Ativo',
    maintenance: 'Em Manutenção',
    inactive: 'Inativo'
  };
  return mapping[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : '');
};

function ResourceTable({ resources, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Extract unique filter options dynamically
  const uniqueTypes = [...new Set(resources.map((r) => r.type).filter(Boolean))].sort();
  const uniqueBuildings = [...new Set(resources.map((r) => r.building).filter(Boolean))].sort();
  const uniqueFloors = [...new Set(resources.map((r) => r.floor).filter((val) => val !== undefined && val !== null))].sort((a, b) => a - b);
  const uniqueStatuses = [...new Set(resources.map((r) => r.status).filter(Boolean))].sort();

  const formatFeaturesText = (features) => {
    let obj = {};
    if (typeof features === 'string') {
      try {
        obj = JSON.parse(features);
      } catch (e) {
        return '';
      }
    } else {
      obj = features;
    }

    if (!obj || Object.keys(obj).length === 0) return '';

    const parts = [];
    if (obj.capacity) parts.push(`Capacidade: ${obj.capacity} p.`);
    if (obj.wifi) parts.push('Wi-Fi');
    if (obj.projector) parts.push('Projetor');
    if (obj.tv) parts.push('TV');
    if (obj.whiteboard) parts.push('Quadro Branco');
    if (obj.standing_desk) parts.push('Standing Desk');
    if (obj.window_seat) parts.push('Junto à Janela');
    if (obj.dual_monitor) parts.push('Mon. Duplo');
    if (obj.accessible) parts.push('♿ Acessível (PMR)');
    if (obj.size) parts.push(`${obj.size}"`);
    if (obj.resolution) parts.push(obj.resolution);
    if (obj.usb_c) parts.push('USB-C');
    if (obj.wireless) parts.push('Sem Fios');
    if (obj.ergonomic) parts.push('Ergonómico');
    if (obj.noise_cancelling) parts.push('Cancelamento de Ruído');
    if (obj.microphone) parts.push('Microfone');
    if (obj.built_in_mic) parts.push('Mic. Integrado');
    if (obj.length) parts.push(`Comprimento: ${obj.length}`);
    if (obj.connector_type) parts.push(`Conector: ${obj.connector_type}`);
    if (obj.power) parts.push(`Potência: ${obj.power}`);

    return parts.join(' | ');
  };

  const filteredResources = resources.filter((r) => {
    const matchesSearch = (r.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || r.type === selectedType;
    const matchesBuilding = !selectedBuilding || r.building === selectedBuilding;
    const matchesFloor = !selectedFloor || String(r.floor) === String(selectedFloor);
    const matchesStatus = !selectedStatus || r.status === selectedStatus;

    return matchesSearch && matchesType && matchesBuilding && matchesFloor && matchesStatus;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedBuilding('');
    setSelectedFloor('');
    setSelectedStatus('');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px] w-full">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Procurar
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Procurar por nome do recurso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>

        <div className="w-full md:w-44">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Tipo
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
          >
            <option value="">Todos</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {translateType(type)}
              </option>
            ))}
          </select>
        </div>

        {uniqueBuildings.length > 1 && (
          <div className="w-full md:w-44">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Edifício
            </label>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
            >
              <option value="">Todos</option>
              {uniqueBuildings.map((building) => (
                <option key={building} value={building}>
                  {building}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="w-full md:w-28">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Piso
          </label>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
          >
            <option value="">Todos</option>
            {uniqueFloors.map((floor) => (
              <option key={floor} value={floor}>
                Piso {floor}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-36">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Estado
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
          >
            <option value="">Todos</option>
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {translateStatus(status)}
              </option>
            ))}
          </select>
        </div>

        {(searchTerm || selectedType || selectedBuilding || selectedFloor || selectedStatus) && (
          <button
            onClick={handleResetFilters}
            className="w-full md:w-auto px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
            Limpar
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center text-xs text-gray-500 px-1">
        <span>
          A mostrar <b>{filteredResources.length}</b> de <b>{resources.length}</b> recursos
        </span>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm table-auto min-w-[800px] lg:min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold w-1/3">Nome</th>
                <th className="px-6 py-4 font-semibold w-24">Tipo</th>
                <th className="px-6 py-4 font-semibold w-1/4">Edifício</th>
                <th className="px-6 py-4 font-semibold w-24">Piso</th>
                <th className="px-6 py-4 font-semibold w-24">Estado</th>
                <th className="px-6 py-4 font-semibold text-center w-48">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Nenhum recurso encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredResources.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{r.name}</div>
                      {r.features && formatFeaturesText(r.features) && (
                        <div className="text-[10px] text-gray-400 mt-0.5 font-medium truncate">
                          {formatFeaturesText(r.features)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">{translateType(r.type)}</td>
                    <td className="px-6 py-4">{r.building || 'Edifício Principal'}</td>
                    <td className="px-6 py-4">Piso {r.floor}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full ${
                          r.status === 'active' ? 'bg-success-light text-success' : 'bg-admin-light text-admin'
                        }`}
                      >
                        {translateStatus(r.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onEdit(r)}
                          className="bg-primary-soft text-primary px-3 py-1.5 rounded-lg text-xs font-bold border border-primary-light cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(r.id, r.name)}
                          className="bg-admin-soft text-admin px-3 py-1.5 rounded-lg text-xs font-bold border border-admin-light cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ResourceTable;
