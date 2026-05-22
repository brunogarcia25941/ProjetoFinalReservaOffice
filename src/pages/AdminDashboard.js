import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API_URL from '../config';
import { useQuery, useQueryClient } from '@tanstack/react-query';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('reservas');
  
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaPassword, setNovaPassword] = useState('');
  const [modalErro, setModalErro] = useState('');
  const [modalSucesso, setModalSucesso] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState({ id: '', name: '', email: '', role: '' });

  const [isRecursoModalOpen, setIsRecursoModalOpen] = useState(false);
  const [isEditRecursoModalOpen, setIsEditRecursoModalOpen] = useState(false);
  
  const [novoRecurso, setNovoRecurso] = useState({ name: '', type: 'desk', floor: 1, status: 'active' });
  const [editingRecurso, setEditingRecurso] = useState({ id: '', name: '', type: '', floor: '', status: '' });

  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  // Query para Utilizadores
  const { data: utilizadores = [], isError: isErrorReservas } = useQuery({
    queryKey: ['utilizadores'],
    queryFn: () => axios.get(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
    enabled: !!token
  });

  // Query para Reservas
  const { data: todasReservas = [] } = useQuery({
    queryKey: ['reservas'],
    queryFn: () => axios.get(`${API_URL}/bookings/all`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
    enabled: !!token
  });

  // Query para Recursos
  const { data: recursos = [] } = useQuery({
    queryKey: ['recursos'],
    queryFn: () => axios.get(`${API_URL}/resources`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data),
    enabled: !!token
  });

  // Query para Picklists
  const { data: picklists = { roles: [], resourceTypes: [], resourceStatuses: [] } } = useQuery({
    queryKey: ['picklists'],
    queryFn: () => axios.get(`${API_URL}/picklists`).then(res => res.data)
  });



  const handleLogout = () => {
    logout();
    navigate('/login');
  };





  const handleRegistarUtilizador = async (e) => {
    e.preventDefault();
    setModalErro('');
    setModalSucesso('');

    try {
      await axios.post(`${API_URL}/auth/register`, {
        name: novoNome,
        email: novoEmail,
        password: novaPassword
      });

      setModalSucesso("Utilizador registado!");
      
      setNovoNome('');
      setNovoEmail('');
      setNovaPassword('');
      
      queryClient.invalidateQueries({ queryKey: ['utilizadores'] });

      setTimeout(() => {
        setIsModalOpen(false);
        setModalSucesso('');
      }, 2000);

    } catch (error) {
      setModalErro(error.response?.data?.message || "Erro ao registar.");
    }
  };

  const handleEliminarUtilizador = async (id, nome) => {
    const efetuarEliminacao = async () => {
      try {
        await axios.delete(`${API_URL}/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.info("Utilizador removido.");
        queryClient.invalidateQueries({ queryKey: ['utilizadores'] });
      } catch (error) {
        toast.error("Erro ao eliminar.");
      }
    };

    toast(
      ({ closeToast }) => (
        <div className="flex flex-col">
          <h4 className="font-bold text-gray-800 mb-1 text-base">Eliminar Utilizador</h4>
          <p className="text-sm text-gray-600 mb-4">
            Tens a certeza que queres eliminar <b>{nome}</b>?
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => { efetuarEliminacao(); closeToast(); }} 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors"
            >
              Eliminar
            </button>
            <button 
              onClick={closeToast} 
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 font-bold py-2 px-3 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ), 
      { autoClose: false, closeOnClick: false, draggable: false, position: "top-center", theme: "light" }
    );
  };

  const handleActualizarUtilizador = async (e) => {
    e.preventDefault();
    setModalErro('');
    setModalSucesso('');
    try {
      await axios.put(`${API_URL}/admin/users/${editingUser.id}`, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalSucesso("Dados atualizados!");
      queryClient.invalidateQueries({ queryKey: ['utilizadores'] });
      setTimeout(() => { setIsEditModalOpen(false); setModalSucesso(''); }, 1500);
    } catch (error) {
      setModalErro(error.response?.data?.message || "Erro ao atualizar.");
    }
  };


  const handleRegistarRecurso = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/resources`, novoRecurso, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Recurso criado!");
      setIsRecursoModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['recursos'] });

      setNovoRecurso({ name: '', type: 'desk', floor: 1, status: 'active' });
    } catch (error) {
      toast.error("Erro ao criar recurso.");
    }
  };

const handleEliminarRecurso = async (id, nome) => {
    const efetuarEliminacao = async () => {
      try {
        await axios.delete(`${API_URL}/resources/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.info("Recurso removido.");
        queryClient.invalidateQueries({ queryKey: ['recursos'] });
      } catch (error) {
        toast.error("Erro ao eliminar recurso.");
      }
    };

    toast(
      ({ closeToast }) => (
        <div className="flex flex-col">
          <h4 className="font-bold text-gray-800 mb-1 text-base">Eliminar Recurso</h4>
          <p className="text-sm text-gray-600 mb-4">
            Tens a certeza que queres eliminar <b>{nome}</b>? 
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => { efetuarEliminacao(); closeToast(); }} 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors"
            >
              Eliminar
            </button>
            <button 
              onClick={closeToast} 
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 font-bold py-2 px-3 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ), 
      { autoClose: false, closeOnClick: false, draggable: false, position: "top-center", theme: "light" }
    );
  };

  const handleActualizarRecurso = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/resources/${editingRecurso.id}`, editingRecurso, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.info("Recurso atualizado!");
      setIsEditRecursoModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['recursos'] });
    } catch (error) {
      toast.error("Erro ao atualizar recurso.");
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          
          {/* Sistema de Tabs */}
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('reservas')}
              className={`px-5 py-2 font-bold rounded-lg transition-all duration-200 ${activeTab === 'reservas' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Visão Geral de Reservas
            </button>
            <button 
              onClick={() => setActiveTab('utilizadores')}
              className={`px-5 py-2 font-bold rounded-lg transition-all duration-200 ${activeTab === 'utilizadores' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Lista de Colaboradores
            </button>
            <button 
              onClick={() => setActiveTab('recursos')}
              className={`px-5 py-2 font-bold rounded-lg transition-all duration-200 ${activeTab === 'recursos' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Recursos
            </button>
          </div>
          
          {/* Botões Dinâmicos de Criação */}
          {activeTab === 'utilizadores' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center gap-2 hover:shadow-md active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
              Registar Novo Colaborador
            </button>
          )}

          {activeTab === 'recursos' && (
            <button 
              onClick={() => setIsRecursoModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center gap-2 hover:shadow-md active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
              Adicionar Novo Recurso
            </button>
          )}
        </div>
        
        {isErrorReservas ? (
          <div className="bg-red-50 text-red-600 border border-red-200 p-6 rounded-xl text-center shadow-sm">
            <h3 className="text-lg font-bold">Erro ao carregar dados. Verifique a sua ligação.</h3>
          </div>
        ) : (
          <>
            {/* TABELA DE RESERVAS */}
            {activeTab === 'reservas' && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
                <table className="w-full text-left text-sm text-gray-600 table-fixed">
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
                        const dataInicio = new Date(reserva.start_time).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
                        const dataFim = new Date(reserva.end_time).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
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

            {/* TABELA DE UTILIZADORES */}
            {activeTab === 'utilizadores' && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
                <table className="w-full text-left text-sm text-gray-600 table-fixed">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                    <tr>
                      <th className="px-6 py-4 font-semibold">ID</th>
                      <th className="px-6 py-4 font-semibold">Nome Completo</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Cargo (Role)</th>
                      <th className="px-6 py-4 font-semibold text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {utilizadores.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">A carregar colaboradores...</td>
                      </tr>
                    ) : (
                      utilizadores.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-gray-400">#{user.id}</td>
                          <td className="px-6 py-4 font-semibold text-gray-800">{user.name}</td>
                          <td className="px-6 py-4">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border 
                                ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'}`}>
                              {picklists.roles.find(r => r.id === user.role)?.label || user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center flex justify-center gap-2">
                            <button 
                              onClick={() => { setEditingUser(user); setIsEditModalOpen(true); }}
                              className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                              Editar
                            </button>
                            
                            <button 
                              onClick={() => handleEliminarUtilizador(user.id, user.name)}
                              className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'recursos' && (
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
                    {recursos.map((r) => (
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
                          <button onClick={() => { setEditingRecurso(r); setIsEditRecursoModalOpen(true); }} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200">Editar</button>
                          <button onClick={() => handleEliminarRecurso(r.id, r.name)} className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>


      {/* MODAL DE EDIÇÃO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full relative">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h3 className="text-xl font-bold mb-6">Editar Colaborador</h3>
            
            {modalErro && <div className="mb-4 text-red-600 text-sm bg-red-50 p-2 rounded">{modalErro}</div>}
            {modalSucesso && <div className="mb-4 text-green-600 text-sm bg-green-50 p-2 rounded">{modalSucesso}</div>}
            
            <form onSubmit={handleActualizarUtilizador} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input type="text" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="w-full border border-gray-300 p-2 rounded text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="w-full border border-gray-300 p-2 rounded text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo (Role)</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full border border-gray-300 p-2 rounded text-sm"
                >
                  {picklists.roles.map(role => (
                    <option key={role.id} value={role.id}>{role.label}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 mt-4">Salvar Alterações</button>
            </form>
          </div>
        </div>
      )}
    

      {/* Modal de Registo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-6">Adicionar Colaborador</h3>
            {modalErro && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{modalErro}</div>}
            {modalSucesso && <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">{modalSucesso}</div>}
            <form onSubmit={handleRegistarUtilizador} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input type="text" required value={novoNome} onChange={(e) => setNovoNome(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Ex: João Silva" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Profissional</label>
                <input type="email" required value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Ex: joao.silva@softinsa.pt" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Palavra-passe Inicial</label>
                <input type="password" required minLength="6" value={novaPassword} onChange={(e) => setNovaPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Mínimo 6 caracteres" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors mt-2">Criar Conta</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Criar Recurso */}
      {isRecursoModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative border border-gray-100">
            <button onClick={() => setIsRecursoModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="p-2 bg-green-100 rounded-lg"><svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg></span>
              Novo Recurso
            </h3>
            <form onSubmit={handleRegistarRecurso} className="space-y-4">
              <input type="text" placeholder="Nome (Ex: Mesa B02)" className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" required
                onChange={(e) => setNovoRecurso({...novoRecurso, name: e.target.value})} />

              <select
                className="w-full border border-gray-300 p-3 rounded-xl text-sm"
                onChange={(e) => setNovoRecurso({ ...novoRecurso, type: e.target.value })}
              >
                {picklists.resourceTypes.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>{tipo.label}</option>
                ))}
              </select>

              <input type="number" placeholder="Piso" className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" required
                onChange={(e) => setNovoRecurso({...novoRecurso, floor: e.target.value})} />

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
                Criar Recurso
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Recurso */}
      {isEditRecursoModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative">
            <button onClick={() => setIsEditRecursoModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-6">Editar {editingRecurso.name}</h3>
            <form onSubmit={handleActualizarRecurso} className="space-y-4">
              <input type="text" value={editingRecurso.name} className="w-full border border-gray-300 p-3 rounded-xl text-sm" required
                onChange={(e) => setEditingRecurso({...editingRecurso, name: e.target.value})} />
              
              {/*<select value={editingRecurso.status} className="w-full border border-gray-300 p-3 rounded-xl text-sm bg-white" 
                onChange={(e) => setEditingRecurso({...editingRecurso, status: e.target.value})}>
                <option value="active">Ativo (Livre)</option>
                <option value="maintenance">Em Manutenção</option>
              </select>*/}
              <select
                value={editingRecurso.status}
                className="w-full border border-gray-300 p-3 rounded-xl text-sm bg-white"
                onChange={(e) => setEditingRecurso({ ...editingRecurso, status: e.target.value })}
              >
                {picklists.resourceStatuses.map(status => (
                  <option key={status.id} value={status.id}>{status.label}</option>
                ))}
              </select>

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all">
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;