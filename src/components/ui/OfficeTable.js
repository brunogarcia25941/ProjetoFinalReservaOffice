import React from 'react';

function OfficeTable({ offices, onEdit, onDelete }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm table-fixed">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-4 font-semibold w-1/4">Nome</th>
            <th className="px-6 py-4 font-semibold w-1/4">Morada</th>
            <th className="px-6 py-4 font-semibold w-1/6">Funcionamento</th>
            <th className="px-6 py-4 font-semibold w-1/6">Fuso Horário</th>
            <th className="px-6 py-4 font-semibold w-1/12 text-center">Estado</th>
            <th className="px-6 py-4 font-semibold w-1/12 text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {offices.map((office) => (
            <tr key={office.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-semibold">{office.name}</td>
              <td className="px-6 py-4 truncate">{office.address || 'Sem morada registada'}</td>
              <td className="px-6 py-4 text-xs">
                {office.operating_hours_start?.substring(0, 5)} - {office.operating_hours_end?.substring(0, 5)}
              </td>
              <td className="px-6 py-4 text-xs font-mono text-gray-500">{office.timezone}</td>
              <td className="px-6 py-4 text-center">
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${office.active ? 'bg-success-light text-success' : 'bg-admin-light text-admin'}`}>
                  {office.active ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td className="px-6 py-4 text-center flex justify-center gap-2">
                <button 
                  onClick={() => onEdit(office)} 
                  className="bg-primary-soft text-primary px-3 py-1.5 rounded-lg text-xs font-bold border border-primary-light"
                >
                  Editar
                </button>
                {office.active && (
                  <button 
                    onClick={() => onDelete(office.id, office.name)} 
                    className="bg-admin-soft text-admin px-3 py-1.5 rounded-lg text-xs font-bold border border-admin-light"
                  >
                    Desativar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OfficeTable;
