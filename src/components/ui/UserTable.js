import React from 'react';

function UserTable({ users, picklists, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
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
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">A carregar colaboradores...</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">#{user.id}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-700">{user.home_office || 'Global'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border 
                        ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-primary-soft text-primary border-primary-light'}`}>
                      {picklists?.roles?.find(r => r.id === user.role)?.label || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(user)}
                        className="bg-primary-soft text-primary border border-primary-light hover:bg-primary-light hover:border-primary transition-all font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Editar
                      </button>

                      <button
                        onClick={() => onDelete(user.id, user.name)}
                        className="bg-admin-soft text-admin border border-admin-light hover:bg-admin-light hover:border-admin transition-all font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
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
  );
}

export default UserTable;
