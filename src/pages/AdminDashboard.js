import React, { useState, useContext } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PlantaEditor from '../components/PlantaEditor';
import Navbar from '../components/layout/Navbar';
import Modal from '../components/ui/Modal';
import UserTable from '../components/ui/UserTable';
import ResourceTable from '../components/ui/ResourceTable';
import BookingTable from '../components/ui/BookingTable';
import UserForm from '../components/forms/UserForm';
import ResourceForm from '../components/forms/ResourceForm';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('reservas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRecursoModalOpen, setIsRecursoModalOpen] = useState(false);
  const [isEditRecursoModalOpen, setIsEditRecursoModalOpen] = useState(false);

  const [novoUser, setNovoUser] = useState({ name: '', email: '', password: '' });
  const [editingUser, setEditingUser] = useState({ id: '', name: '', email: '', role: '' });
  const [novoRecurso, setNovoRecurso] = useState({ name: '', type: 'desk', floor: 1, status: 'active' });
  const [editingRecurso, setEditingRecurso] = useState({ id: '', name: '', type: '', floor: '', status: '' });

  const [pisoSelecionado, setPisoSelecionado] = useState(1);
  const { token, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Queries
  const { data: utilizadores = [], isError: isErrorUsers } = useQuery({
    queryKey: ['utilizadores'],
    queryFn: () => api.get(`/admin/users`).then(res => res.data),
    enabled: !!token
  });

  const { data: todasReservas = [] } = useQuery({
    queryKey: ['reservas'],
    queryFn: () => api.get(`/bookings/all`).then(res => res.data),
    enabled: !!token
  });

  const { data: recursos = [] } = useQuery({
    queryKey: ['recursos'],
    queryFn: () => api.get(`/resources`).then(res => res.data),
    enabled: !!token
  });

  const { data: picklists = { roles: [], resourceTypes: [], resourceStatuses: [] } } = useQuery({
    queryKey: ['picklists'],
    queryFn: () => api.get(`/picklists`).then(res => res.data)
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // User Actions
  const handleRegistarUtilizador = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/auth/register`, novoUser);
      toast.success("Utilizador registado!");
      setNovoUser({ name: '', email: '', password: '' });
      queryClient.invalidateQueries({ queryKey: ['utilizadores'] });
      setIsModalOpen(false);
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors && data.errors.length > 0) {
        // Exibe o primeiro erro de validação detalhado
        const firstErrorKey = Object.keys(data.errors[0])[0];
        toast.error(data.errors[0][firstErrorKey]);
      } else {
        toast.error(data?.message || "Erro ao registar.");
      }
    }
  };

  const handleEliminarUtilizador = async (id, nome) => {
    const efetuarEliminacao = async () => {
      try {
        await api.delete(`/admin/users/${id}`);
        toast.info("Utilizador removido.");
        queryClient.invalidateQueries({ queryKey: ['utilizadores'] });
      } catch (error) {
        toast.error("Erro ao eliminar.");
      }
    };

    toast(({ closeToast }) => (
      <div className="flex flex-col">
        <h4 className="font-bold text-gray-800 mb-1 text-base">Eliminar Utilizador</h4>
        <p className="text-sm text-gray-600 mb-4">Tens a certeza que queres eliminar <b>{nome}</b>?</p>
        <div className="flex gap-2">
          <button onClick={() => { efetuarEliminacao(); closeToast(); }} className="flex-1 bg-admin hover:bg-admin-hover text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors">Eliminar</button>
          <button onClick={closeToast} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 font-bold py-2 px-3 rounded-lg text-sm transition-colors">Cancelar</button>
        </div>
      </div>
    ), { autoClose: false, closeOnClick: false, draggable: false, position: "top-center", theme: "light" });
  };

  const handleActualizarUtilizador = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${editingUser.id}`, editingUser);
      toast.success("Dados atualizados!");
      queryClient.invalidateQueries({ queryKey: ['utilizadores'] });
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao atualizar.");
    }
  };

  // Resource Actions
  const handleRegistarRecurso = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/resources`, novoRecurso);
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
        await api.delete(`/resources/${id}`);
        toast.info("Recurso removido.");
        queryClient.invalidateQueries({ queryKey: ['recursos'] });
      } catch (error) {
        toast.error("Erro ao eliminar recurso.");
      }
    };

    toast(({ closeToast }) => (
      <div className="flex flex-col">
        <h4 className="font-bold text-gray-800 mb-1 text-base">Eliminar Recurso</h4>
        <p className="text-sm text-gray-600 mb-4">Tens a certeza que queres eliminar <b>{nome}</b>?</p>
        <div className="flex gap-2">
          <button onClick={() => { efetuarEliminacao(); closeToast(); }} className="flex-1 bg-admin hover:bg-admin-hover text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors">Eliminar</button>
          <button onClick={closeToast} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 font-bold py-2 px-3 rounded-lg text-sm transition-colors">Cancelar</button>
        </div>
      </div>
    ), { autoClose: false, closeOnClick: false, draggable: false, position: "top-center", theme: "light" });
  };

  const handleActualizarRecurso = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/resources/${editingRecurso.id}`, editingRecurso);
      toast.info("Recurso atualizado!");
      setIsEditRecursoModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['recursos'] });
    } catch (error) {
      toast.error("Erro ao atualizar recurso.");
    }
  };

  const salvarCoordenadasNaBD = async (id, x, y, r = 0) => {
    try {
      const finalX = x === undefined ? null : x;
      const finalY = y === undefined ? null : y;
      const finalR = r === undefined ? 0 : r;
      await api.put(`/resources/${id}/position`, { pos_x: finalX, pos_y: finalY, rotation: finalR });
      queryClient.setQueryData(['recursos'], (antigos) => antigos.map(rec => rec.id === id ? { ...rec, pos_x: finalX, pos_y: finalY, rotation: finalR } : rec));
      toast.success("Posição do recurso atualizada no mapa!");
    } catch (error) {
      toast.error("Erro ao guardar a posição no servidor.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      <Navbar user={user} logout={handleLogout} isAdmin={true} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            {['reservas', 'utilizadores', 'recursos', 'mapa'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 font-bold rounded-lg transition-all duration-200 capitalize ${activeTab === tab ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                {tab === 'mapa' ? 'Mapa do Escritório' : tab === 'utilizadores' ? 'Lista de Colaboradores' : tab === 'reservas' ? 'Visão Geral de Reservas' : tab}
              </button>
            ))}
          </div>

          {activeTab === 'utilizadores' && (
            <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center gap-2 hover:shadow-md active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
              Registar Novo Colaborador
            </button>
          )}

          {activeTab === 'recursos' && (
            <button onClick={() => setIsRecursoModalOpen(true)} className="bg-success hover:bg-success-hover text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center gap-2 hover:shadow-md active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Adicionar Novo Recurso
            </button>
          )}
        </div>

        {isErrorUsers ? (
          <div className="bg-admin-soft text-admin border-admin-light p-6 rounded-xl text-center shadow-sm">
            <h3 className="text-lg font-bold">Erro ao carregar dados. Verifique a sua ligação.</h3>
          </div>
        ) : (
          <>
            {activeTab === 'reservas' && <BookingTable bookings={todasReservas} />}
            {activeTab === 'utilizadores' && <UserTable users={utilizadores} picklists={picklists} onEdit={(u) => { setEditingUser(u); setIsEditModalOpen(true); }} onDelete={handleEliminarUtilizador} />}
            {activeTab === 'recursos' && <ResourceTable resources={recursos} onEdit={(r) => { setEditingRecurso(r); setIsEditRecursoModalOpen(true); }} onDelete={handleEliminarRecurso} />}
            {activeTab === 'mapa' && (
              <div className="animate-fade-in space-y-4">
                <div className="flex gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  {[1, 2, 3].map(piso => (
                    <button key={piso} onClick={() => setPisoSelecionado(piso)} className={`px-4 py-2 rounded-lg font-bold transition-all ${pisoSelecionado === piso ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Piso {piso}</button>
                  ))}
                </div>
                <PlantaEditor recursos={recursos.filter(r => Number(r.floor) === pisoSelecionado)} setRecursos={(novos) => queryClient.setQueryData(['recursos'], novos)} salvarCoordenadasNaBD={salvarCoordenadasNaBD} pisoAtual={pisoSelecionado} modoAdmin={true} />
              </div>
            )}
          </>
        )}
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Colaborador">
        <UserForm user={novoUser} onChange={setNovoUser} onSubmit={handleRegistarUtilizador} />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Colaborador">
        <UserForm user={editingUser} onChange={setEditingUser} onSubmit={handleActualizarUtilizador} picklists={picklists} isEdit />
      </Modal>

      <Modal isOpen={isRecursoModalOpen} onClose={() => setIsRecursoModalOpen(false)} title="Novo Recurso" icon={<svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>}>
        <ResourceForm resource={novoRecurso} onChange={setNovoRecurso} onSubmit={handleRegistarRecurso} picklists={picklists} />
      </Modal>

      <Modal isOpen={isEditRecursoModalOpen} onClose={() => setIsEditRecursoModalOpen(false)} title={`Editar ${editingRecurso.name}`}>
        <ResourceForm resource={editingRecurso} onChange={setEditingRecurso} onSubmit={handleActualizarRecurso} picklists={picklists} isEdit />
      </Modal>
    </div>
  );
}

export default AdminDashboard;