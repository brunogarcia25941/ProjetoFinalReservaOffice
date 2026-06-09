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
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {r.status}
                </span>
              </td>
              <td className="px-6 py-4 text-center flex justify-center gap-2">
                <button 
                  onClick={() => onEdit(r)} 
                  className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200"
                >
                  Editar
                </button>
                <button 
                  onClick={() => onDelete(r.id, r.name)} 
                  className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200"
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
