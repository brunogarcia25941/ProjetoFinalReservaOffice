import React from 'react';

function ResourceTable({ resources, onEdit, onDelete }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm table-fixed">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-4 font-semibold">Nome</th>
            <th className="px-6 py-4 font-semibold">Tipo</th>
            <th className="px-6 py-4 font-semibold">Piso</th>
            <th className="px-6 py-4 font-semibold">Estado</th>
            <th className="px-6 py-4 font-semibold text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {resources.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-semibold">{r.name}</td>
              <td className="px-6 py-4 capitalize">{r.type}</td>
              <td className="px-6 py-4">Piso {r.floor}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${r.status === 'active' ? 'bg-success-light text-success' : 'bg-admin-light text-admin'}`}>
                  {r.status}
                </span>
              </td>
              <td className="px-6 py-4 text-center flex justify-center gap-2">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResourceTable;
