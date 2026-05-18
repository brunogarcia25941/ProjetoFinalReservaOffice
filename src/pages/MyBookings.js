import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API_URL from '../config';

function MyBookings() {
  const [reservas, setReservas] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [erro, setErro] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reservaEditando, setReservaEditando] = useState(null);
  
  const { logout, token, user } = useContext(AuthContext); 
  const navigate = useNavigate();

  const getIniciais = (nome) => {
    if (!nome) return 'U';
    const partes = nome.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return partes[0][0].toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  useEffect(() => {
    // Carregar reservas do utilizador
    axios.get(`${API_URL}/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => setReservas(response.data))
      .catch((error) => {
        console.error("Erro na API:", error);
        setErro("Não foi possível carregar as tuas reservas.");
      });

    // Carregar lista de recursos para o modal de edição
    axios.get(`${API_URL}/resources`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => setRecursos(response.data))
      .catch((error) => console.error("Erro ao carregar recursos:", error));
  }, [token]);

  const cancelarReserva = async (id, nomeRecurso) => {
    const efetuarCancelamento = async () => {
      try {
        await axios.put(`${API_URL}/bookings/${id}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Reserva cancelada!');
        // Atualizar estado local sem reload
        setReservas(prev => 
          prev.map(r => r.booking_id === id ? { ...r, status: 'cancelled' } : r)
        );
      } catch (error) {
        toast.error('Erro ao cancelar a reserva.');
      }
    };

    // Confirmação via Toast
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col">
          <h4 className="font-bold text-gray-800 mb-1 text-base">Cancelar Reserva</h4>
          <p className="text-sm text-gray-600 mb-4">
            Queres cancelar a reserva para a <b>{nomeRecurso || 'mesa'}</b>?
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => { efetuarCancelamento(); closeToast(); }} 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors"
            >
              Sim, Cancelar
            </button>
            <button 
              onClick={closeToast} 
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 font-bold py-2 px-3 rounded-lg text-sm transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      ), 
      { autoClose: false, closeOnClick: false, draggable: false, position: "top-center", theme: "light" }
    );
  };

  const abrirModalEdicao = (reserva) => {
    // Ajustar formato para o seletor datetime-local
    const start = new Date(reserva.start_time).toISOString().slice(0, 16);
    const end = new Date(reserva.end_time).toISOString().slice(0, 16);
    
    setReservaEditando({
      ...reserva,
      start_time: start,
      end_time: end
    });
    setIsEditModalOpen(true);
  };

  const atualizarReserva = async (e) => {
    e.preventDefault();
    try {
      // Formatar datas para o MySQL
      const formattedStart = reservaEditando.start_time.replace('T', ' ') + ':00';
      const formattedEnd = reservaEditando.end_time.replace('T', ' ') + ':00';

      await axios.put(`${API_URL}/bookings/${reservaEditando.booking_id}`, {
        resource_id: reservaEditando.resource_id,
        start_time: formattedStart,
        end_time: formattedEnd
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Reserva atualizada!');
      setIsEditModalOpen(false);
      
      // Recarregar lista
      const response = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservas(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar a reserva.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar Superior*/}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <span className="text-xl font-bold text-gray-800">Reserva Office</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
          <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Reservar Mesa</Link>
          <span className="text-blue-600 border-b-2 border-blue-600 pb-1">As Minhas Reservas</span>
          <div className="w-px h-5 bg-gray-300 mx-2"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
              {getIniciais(user?.name)}
            </div>
            <span className="font-medium">{user?.name || 'Utilizador'}</span>
            
            {user?.role === 'admin' && (
              <Link to="/admin" title="Ir para Administração" className="ml-1 text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors cursor-pointer">
                Admin
              </Link>
            )}
          </div>
          <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800 ml-2 font-medium">
            Sair
          </button>
        </div>
      </nav>

      {/* Corpo da Página */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Histórico de Reservas</h2>
        
        {erro && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{erro}</div>}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {reservas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Ainda não efetuaste nenhuma reserva. <Link to="/dashboard" className="text-blue-600 hover:underline">Reserva a tua primeira mesa aqui.</Link>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Recurso</th>
                  <th className="px-6 py-4 font-semibold">Data Início</th>
                  <th className="px-6 py-4 font-semibold">Data Fim</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservas.map((reserva) => {
                  const dataInicio = new Date(reserva.start_time).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
                  const dataFim = new Date(reserva.end_time).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
                  const ativa = reserva.status === 'confirmed';

                  return (
                    <tr key={reserva.booking_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800 block">{reserva.resource_name}</span>
                        <span className="text-xs text-gray-400 capitalize">{reserva.resource_type}</span>
                      </td>
                      <td className="px-6 py-4">{dataInicio}</td>
                      <td className="px-6 py-4">{dataFim}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ativa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {ativa ? 'Confirmada' : 'Cancelada'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {ativa && (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => abrirModalEdicao(reserva)}
                              className="text-blue-600 hover:text-blue-800 font-medium border border-blue-200 hover:border-blue-300 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => cancelarReserva(reserva.booking_id, reserva.resource_name)}
                              className="text-red-500 hover:text-red-700 font-medium border border-red-200 hover:border-red-300 bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* MODAL DE EDIÇÃO */}
      {isEditModalOpen && reservaEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Editar Reserva</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white hover:text-blue-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={atualizarReserva} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Recurso</label>
                <select 
                  value={reservaEditando.resource_id}
                  onChange={(e) => setReservaEditando({...reservaEditando, resource_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                >
                  {recursos.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Início</label>
                  <input 
                    type="datetime-local" 
                    value={reservaEditando.start_time}
                    onChange={(e) => setReservaEditando({...reservaEditando, start_time: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fim</label>
                  <input 
                    type="datetime-local" 
                    value={reservaEditando.end_time}
                    onChange={(e) => setReservaEditando({...reservaEditando, end_time: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-blue-200 text-sm"
                >
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;