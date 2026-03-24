import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function AdminDashboard() {
  const [todasReservas, setTodasReservas] = useState([]);
  const [erro, setErro] = useState(null);
  
  // Estados para controlar o Modal de Registo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaPassword, setNovaPassword] = useState('');
  const [modalErro, setModalErro] = useState('');
  const [modalSucesso, setModalSucesso] = useState('');

  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const carregarTodasReservas = async () => {
    try {
      const response = await axios.get('https://projetofinalreservaoffice-backend.onrender.com/api/bookings/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodasReservas(response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        setErro("Acesso Negado. Não tens permissões de Administrador para ver esta página.");
      } else {
        const erroReal = error.response?.data?.message || error.message;
        setErro(`Erro do Servidor: ${erroReal}`);
      }
    }
  };

  useEffect(() => {
    carregarTodasReservas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Função para lidar com a submissão do formulário de novo utilizador
  const handleRegistarUtilizador = async (e) => {
    e.preventDefault();
    setModalErro('');
    setModalSucesso('');

    try {
      await axios.post('https://projetofinalreservaoffice-backend.onrender.com/api/auth/register', {
        name: novoNome,
        email: novoEmail,
        password: novaPassword
      });

      setModalSucesso(`Utilizador ${novoNome} registado com sucesso!`);
      
      // Limpar os campos do formulário
      setNovoNome('');
      setNovoEmail('');
      setNovaPassword('');
      
      // Fechar o modal após 2 segundos
      setTimeout(() => {
        setIsModalOpen(false);
        setModalSucesso('');
      }, 2000);

    } catch (error) {
      setModalErro(error.response?.data?.message || "Erro ao tentar registar o utilizador.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      {/* Navbar Superior - Versão Admin */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 p-1.5 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <span className="text-xl font-bold text-white">Administração - Reserva Office</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
          <Link to="/dashboard" className="hover:text-white transition-colors">Voltar ao Portal Normal</Link>
          <div className="w-px h-5 bg-gray-700 mx-2"></div>
          <div className="flex items-center gap-2 cursor-pointer text-white">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center font-bold">AD</div>
            <span>Admin</span>
            <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 ml-2 font-medium">Sair</button>
          </div>
        </div>
      </nav>

      {/* Corpo da Página */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Visão Geral de Reservas</h2>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            Registar Novo Colaborador
          </button>
        </div>
        
        {erro ? (
          <div className="bg-red-50 text-red-600 border border-red-200 p-6 rounded-xl text-center shadow-sm">
            <h3 className="text-lg font-bold">{erro}</h3>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Colaborador</th>
                  <th className="px-6 py-4 font-semibold">Recurso</th>
                  <th className="px-6 py-4 font-semibold">Data Início</th>
                  <th className="px-6 py-4 font-semibold">Data Fim</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {todasReservas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Não existem reservas ativas no sistema.</td>
                  </tr>
                ) : (
                  todasReservas.map((reserva) => {
                    const dataInicio = new Date(reserva.start_time).toLocaleString('pt-PT');
                    const dataFim = new Date(reserva.end_time).toLocaleString('pt-PT');
                    const ativa = reserva.status === 'confirmed';

                    return (
                      <tr key={reserva.booking_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-800 block">{reserva.user_name}</span>
                          <span className="text-xs text-gray-400">{reserva.user_email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-800 block">{reserva.resource_name}</span>
                          <span className="text-xs text-gray-400 capitalize">{reserva.resource_type}</span>
                        </td>
                        <td className="px-6 py-4">{dataInicio}</td>
                        <td className="px-6 py-4">{dataFim}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ativa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {ativa ? 'Confirmada' : 'Cancelada'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL DE REGISTO (Sobreposição) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full relative">
            
            {/* Botão de Fechar Modal */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <h3 className="text-xl font-bold text-gray-800 mb-6">Adicionar Colaborador</h3>
            
            {modalErro && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{modalErro}</div>}
            {modalSucesso && <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">{modalSucesso}</div>}

            <form onSubmit={handleRegistarUtilizador} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input 
                  type="text" required
                  value={novoNome} onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Profissional</label>
                <input 
                  type="email" required
                  value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Ex: joao.silva@softinsa.pt"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Palavra-passe Inicial</label>
                <input 
                  type="password" required minLength="6"
                  value={novaPassword} onChange={(e) => setNovaPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors mt-2"
              >
                Criar Conta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;