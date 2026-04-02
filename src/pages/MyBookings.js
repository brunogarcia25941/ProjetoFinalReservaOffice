import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function MyBookings() {
  // --- ESTADOS DO COMPONENTE ---
  // 'reservas' guarda a lista de marcações que vêm da Base de Dados para este utilizador
  const [reservas, setReservas] = useState([]);
  const [erro, setErro] = useState(null);
  
  // Extraímos os dados de sessão (token para a API e função de logout)
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

  // Função para terminar a sessão
  const handleLogout = () => {
    logout();
    navigate('/');
  };


  useEffect(() => {
    // Pedido GET ao Backend para listar as reservas
    axios.get('https://projeto-final-reserva-office-backen.vercel.app/api/bookings', {
      headers: { Authorization: `Bearer ${token}` } // O Token garante que o backend só devolve as reservas Deste utilizador
    })
      .then((response) => setReservas(response.data)) // Atualiza o estado com os dados da API
      .catch((error) => {
        console.error("Erro na API:", error);
        setErro("Não foi possível carregar as tuas reservas.");
      });
  }, [token]);

  // --- FUNÇÃO DE CANCELAMENTO ---
  const cancelarReserva = async (id) => {
    // Pede confirmação ao utilizador para evitar cliques acidentais
    if (!window.confirm('Queres mesmo cancelar esta reserva?')) return;

    try {
      await axios.put(`https://projeto-final-reserva-office-backen.vercel.app/api/bookings/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Reserva cancelada com sucesso!');
      // atualizar essa linha sem precisar de dar reload à pagina
      setReservas(reservasAnteriores => 
        reservasAnteriores.map(reserva => 
          reserva.booking_id === id ? { ...reserva, status: 'cancelled' } : reserva
        )
      );
    } catch (error) {
      console.error("Erro Detalhado:", error.response || error);
      alert('Erro ao tentar cancelar a reserva. Tenta novamente.');
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
                  <th className="px-6 py-4 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservas.map((reserva) => {
                  const dataInicio = new Date(reserva.start_time).toLocaleString('pt-PT');
                  const dataFim = new Date(reserva.end_time).toLocaleString('pt-PT');
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
                          <button 
                            onClick={() => cancelarReserva(reserva.booking_id)}
                            className="text-red-500 hover:text-red-700 font-medium border border-red-200 hover:border-red-300 bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
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
    </div>
  );
}

export default MyBookings;