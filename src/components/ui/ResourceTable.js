import React from 'react';

function ResourceTable({ resources, onEdit, onDelete }) {
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

    return parts.join(' | ');
  };

  return (
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
            {resources.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-800">{r.name}</div>
                  {r.features && formatFeaturesText(r.features) && (
                    <div className="text-[10px] text-gray-400 mt-0.5 font-medium truncate">
                      {formatFeaturesText(r.features)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 capitalize">{r.type}</td>
                <td className="px-6 py-4">{r.building || 'Edifício Principal'}</td>
                <td className="px-6 py-4">Piso {r.floor}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${r.status === 'active' ? 'bg-success-light text-success' : 'bg-admin-light text-admin'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => onEdit(r)} 
                      className="bg-primary-soft text-primary px-3 py-1.5 rounded-lg text-xs font-bold border border-primary-light"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => onDelete(r.id, r.name)} 
                      className="bg-admin-soft text-admin px-3 py-1.5 rounded-lg text-xs font-bold border border-admin-light"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResourceTable;
