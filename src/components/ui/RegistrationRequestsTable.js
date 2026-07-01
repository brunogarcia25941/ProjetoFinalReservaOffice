import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';

function RegistrationRequestsTable() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/registration-requests');
      setRequests(response.data);
    } catch (error) {
      console.error("Erro ao carregar pedidos de registo:", error);
      toast.error("Não foi possível carregar os pedidos de registo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleResolve = async (id, name, action) => {
    const confirmMessage =
      action === 'approved'
        ? `Tens a certeza que desejas aprovar o registo de ${name}?`
        : `Tens a certeza que desejas recusar o registo de ${name}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await api.post(`/admin/registration-requests/${id}/resolve`, { action });
      toast.success(response.data.message);

      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao resolver pedido.");
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      (req.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !selectedStatus || req.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
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
            Estado
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
          >
            <option value="">Todos</option>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Recusado</option>
          </select>
        </div>

        {(searchTerm || selectedStatus) && (
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
          A mostrar <b>{filteredRequests.length}</b> de <b>{requests.length}</b> pedidos
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 table-auto min-w-[900px] lg:min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold w-16">ID</th>
                <th className="px-6 py-4 font-semibold w-1/4">Nome</th>
                <th className="px-6 py-4 font-semibold w-1/4">Email</th>
                <th className="px-6 py-4 font-semibold w-1/3">Motivo / Justificação</th>
                <th className="px-6 py-4 font-semibold text-center w-32">Estado</th>
                <th className="px-6 py-4 font-semibold text-center w-48">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                /* Linha com símbolo de carregamento visual para a tabela de pedidos de registo */
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2 font-semibold">
                      <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>A carregar pedidos de registo pendentes...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Nenhum pedido de registo encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">#{req.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{req.name}</td>
                    <td className="px-6 py-4">{req.email}</td>
                    <td className="px-6 py-4 truncate" title={req.reason}>
                      {req.reason || <span className="text-gray-300 italic">Sem justificação</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full border whitespace-nowrap
                          ${req.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : req.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                      >
                        {req.status === 'pending' ? 'Pendente' : req.status === 'approved' ? 'Aprovado' : 'Recusado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {req.status === 'pending' ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleResolve(req.id, req.name, 'approved')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleResolve(req.id, req.name, 'rejected')}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            Recusar
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium italic">
                          Resolvido em {new Date(req.resolved_at).toLocaleDateString('pt-PT')}
                        </span>
                      )}
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

export default RegistrationRequestsTable;
