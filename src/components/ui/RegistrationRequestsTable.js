import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';

function RegistrationRequestsTable() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const confirmMessage = action === 'approved' 
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

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 table-fixed min-w-[900px]">
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
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">A carregar pedidos de registo...</td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Nenhum pedido de registo encontrado.</td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">#{req.id}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{req.name}</td>
                  <td className="px-6 py-4">{req.email}</td>
                  <td className="px-6 py-4 truncate" title={req.reason}>{req.reason || <span className="text-gray-300 italic">Sem justificação</span>}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full border whitespace-nowrap
                      ${req.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'}`}>
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
  );
}

export default RegistrationRequestsTable;

