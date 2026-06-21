import React, { useState } from 'react';

function OfficeTable({ offices, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '', 'active', 'inactive'

  const filteredOffices = offices.filter((office) => {
    const matchesSearch =
      (office.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (office.address || '').toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = office.active;
    } else if (statusFilter === 'inactive') {
      matchesStatus = !office.active;
    }

    return matchesSearch && matchesStatus;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Procurar
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Procurar por nome ou morada do escritório..."
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

        <div className="w-full md:w-48">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Estado
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
          >
            <option value="">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>

        {(searchTerm || statusFilter) && (
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
          A mostrar <b>{filteredOffices.length}</b> de <b>{offices.length}</b> escritórios
        </span>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm table-auto min-w-[800px] lg:min-w-full">
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
              {filteredOffices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Nenhum escritório encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredOffices.map((office) => (
                  <tr key={office.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">{office.name}</td>
                    <td className="px-6 py-4 truncate">{office.address || 'Sem morada registada'}</td>
                    <td className="px-6 py-4 text-xs">
                      {office.operating_hours_start?.substring(0, 5)} - {office.operating_hours_end?.substring(0, 5)}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">{office.timezone}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full ${
                          office.active ? 'bg-success-light text-success' : 'bg-admin-light text-admin'
                        }`}
                      >
                        {office.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onEdit(office)}
                          className="bg-primary-soft text-primary px-3 py-1.5 rounded-lg text-xs font-bold border border-primary-light cursor-pointer"
                        >
                          Editar
                        </button>
                        {office.active && (
                          <button
                            onClick={() => onDelete(office.id, office.name)}
                            className="bg-admin-soft text-admin px-3 py-1.5 rounded-lg text-xs font-bold border border-admin-light cursor-pointer"
                          >
                            Desativar
                          </button>
                        )}
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

export default OfficeTable;
