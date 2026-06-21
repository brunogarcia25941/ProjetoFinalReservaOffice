import React, { useState } from 'react';

function UserTable({ users, picklists, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('');

  // Extract unique offices dynamically from users
  const uniqueOffices = [...new Set(users.map((u) => u.home_office).filter(Boolean))].sort();

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !selectedRole || u.role === selectedRole;

    const userOffice = u.home_office || 'Global';
    const matchesOffice = !selectedOffice || userOffice === selectedOffice;

    return matchesSearch && matchesRole && matchesOffice;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
    setSelectedOffice('');
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
              placeholder="Procurar por nome ou email..."
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
            Cargo (Role)
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
          >
            <option value="">Todos os Cargos</option>
            {picklists?.roles?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Escritório Base
          </label>
          <select
            value={selectedOffice}
            onChange={(e) => setSelectedOffice(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
          >
            <option value="">Todos os Escritórios</option>
            <option value="Global">Global</option>
            {uniqueOffices.map((office) => (
              <option key={office} value={office}>
                {office}
              </option>
            ))}
          </select>
        </div>

        {(searchTerm || selectedRole || selectedOffice) && (
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
          A mostrar <b>{filteredUsers.length}</b> de <b>{users.length}</b> colaboradores
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 table-auto min-w-[800px] lg:min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold w-16">ID</th>
                <th className="px-6 py-4 font-semibold w-1/4">Nome Completo</th>
                <th className="px-6 py-4 font-semibold w-1/4">Email</th>
                <th className="px-6 py-4 font-semibold w-40">Escritório Base</th>
                <th className="px-6 py-4 font-semibold w-32">Cargo (Role)</th>
                <th className="px-6 py-4 font-semibold text-center w-48">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    A carregar colaboradores...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Nenhum colaborador encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">#{user.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-700">
                      {user.home_office || 'Global'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border 
                          ${
                            user.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-primary-soft text-primary border-primary-light'
                          }`}
                      >
                        {picklists?.roles?.find((r) => r.id === user.role)?.label || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onEdit(user)}
                          className="bg-primary-soft text-primary border border-primary-light hover:bg-primary-light hover:border-primary transition-all font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            ></path>
                          </svg>
                          Editar
                        </button>

                        <button
                          onClick={() => onDelete(user.id, user.name)}
                          className="bg-admin-soft text-admin border border-admin-light hover:bg-admin-light hover:border-admin transition-all font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
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

export default UserTable;
