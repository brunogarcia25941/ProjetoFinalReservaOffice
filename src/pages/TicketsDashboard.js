import React, { useEffect, useState, useContext, useCallback } from 'react';
import api from '../api/axiosConfig';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Navbar from '../components/layout/Navbar';
import Modal from '../components/ui/Modal';
import Footer from '../components/layout/Footer';

function TicketsDashboard() {
  const [tickets, setTickets] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // States para novos tickets
  const [newTicket, setNewTicket] = useState({
    resource_id: '',
    title: '',
    description: '',
    urgency: 'medium'
  });

  useEffect(() => {
    const resourceIdParam = searchParams.get('resource_id');
    if (resourceIdParam) {
      setNewTicket(prev => ({ ...prev, resource_id: resourceIdParam }));
      setIsCreateModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // States para resolução de tickets
  const [resolvingTicketId, setResolvingTicketId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroUrgencia, setFiltroUrgencia] = useState('todos');

  const { logout, user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isTechOrAdmin = user?.role === 'tecnico' || user?.role === 'admin';

  // Função para carregar os tickets com opção de loading silencioso
  const carregarTickets = useCallback(async (mostrarLoading = false) => {
    if (!token) return;
    if (mostrarLoading) setIsLoading(true); // Só mostra o loading visual se solicitado
    try {
      const response = await api.get('/tickets');
      setTickets(response.data);
    } catch (error) {
      toast.error("Erro ao carregar tickets.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const carregarRecursos = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.get('/resources');
      setRecursos(response.data);
    } catch (error) {
      console.error("Erro ao carregar recursos:", error);
    }
  }, [token]);

  useEffect(() => {
    carregarTickets(true);
    carregarRecursos();
    const interval = setInterval(() => {
      carregarTickets(false);
      carregarRecursos();
    }, 10000);
    return () => clearInterval(interval);
  }, [carregarTickets, carregarRecursos]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.title || !newTicket.description) {
      toast.warn("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      await api.post('/tickets', {
        resource_id: newTicket.resource_id ? parseInt(newTicket.resource_id) : null,
        title: newTicket.title,
        description: newTicket.description,
        urgency: newTicket.urgency
      });
      toast.success("Ocorrência reportada com sucesso!");
      setIsCreateModalOpen(false);
      setNewTicket({ resource_id: '', title: '', description: '', urgency: 'medium' });
      carregarTickets();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao criar ticket.");
    }
  };

  const handleAssignTicket = async (ticketId) => {
    try {
      await api.put(`/tickets/${ticketId}/assign`);
      toast.success("Assumiu a responsabilidade deste ticket!");
      carregarTickets();
    } catch (error) {
      toast.error("Erro ao assumir o ticket.");
    }
  };

  const handleResolveTicket = async (e) => {
    e.preventDefault();
    if (!resolvingTicketId) return;

    try {
      await api.put(`/tickets/${resolvingTicketId}/status`, {
        status: 'resolved',
        resolution_notes: resolutionNotes
      });
      toast.success("Ticket marcado como resolvido!");
      setIsResolveModalOpen(false);
      setResolvingTicketId(null);
      setResolutionNotes('');
      carregarTickets();
    } catch (error) {
      toast.error("Erro ao fechar o ticket.");
    }
  };

  const ticketsFiltrados = tickets.filter(t => {
    const passaStatus = filtroStatus === 'todos' || t.status === filtroStatus;
    const passaUrgencia = filtroUrgencia === 'todos' || t.urgency === filtroUrgencia;
    return passaStatus && passaUrgencia;
  });

  const getUrgencyBadge = (urgency) => {
    const styles = {
      high: 'bg-admin-soft text-admin border border-admin-light',
      medium: 'bg-warning-soft text-warning-hover border border-warning-light',
      low: 'bg-primary-soft text-primary-hover border border-primary-light'
    };
    const labels = { high: 'Alta', medium: 'Média', low: 'Baixa' };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[urgency]}`}>{labels[urgency]}</span>;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-700 border border-gray-200',
      in_progress: 'bg-primary-soft text-primary border border-primary-light animate-pulse',
      resolved: 'bg-success-soft/40 text-success border border-success-light',
      cancelled: 'bg-red-50 text-red-500 border border-red-100'
    };
    const labels = { pending: 'Pendente', in_progress: 'Em Curso', resolved: 'Resolvido', cancelled: 'Cancelado' };
    return <span className={`px-2 py-1 rounded-lg text-xs font-bold ${styles[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar user={user} logout={handleLogout} />

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isTechOrAdmin ? "Gestão de Avarias e Suporte" : "Suporte & Ocorrências"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isTechOrAdmin
                ? "Painel técnico para visualização, atribuição e resolução de avarias reportadas."
                : "Reporte avarias nos recursos do escritório e acompanhe o estado de resolução."}
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-primary-light transition-all flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Reportar Ocorrência
          </button>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Estado</span>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="border border-gray-300 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-white font-semibold text-gray-700"
            >
              <option value="todos">Todos</option>
              <option value="pending">Pendente</option>
              <option value="in_progress">Em Curso</option>
              <option value="resolved">Resolvidos</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Urgência</span>
            <select
              value={filtroUrgencia}
              onChange={(e) => setFiltroUrgencia(e.target.value)}
              className="border border-gray-300 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-white font-semibold text-gray-700"
            >
              <option value="todos">Todas</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </div>

          <div className="ml-auto text-xs text-gray-400 font-medium">
            A mostrar {ticketsFiltrados.length} ocorrência(s).
          </div>
        </div>

        {/* Lista de Tickets */}
        {isLoading ? (
          /* Símbolo de carregamento visual para a lista de tickets de avarias */
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500 font-semibold bg-white border border-gray-200 rounded-xl shadow-sm animate-fade-in">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>A carregar ocorrências reportadas...</span>
          </div>
        ) : ticketsFiltrados.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            <h4 className="font-bold text-gray-700 text-lg">Sem Avarias Registadas</h4>
            <p className="text-sm text-gray-400 mt-1">De momento não existem problemas reportados com estes filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ticketsFiltrados.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">#T-{ticket.id}</span>
                      {getUrgencyBadge(ticket.urgency)}
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <h3 className="text-base font-bold text-gray-800 mb-1">{ticket.title}</h3>
                  <p className="text-xs text-gray-600 line-clamp-3 mb-4 leading-relaxed">{ticket.description}</p>

                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-1.5 text-xs text-gray-500 mb-4">
                    {ticket.resource_name && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Recurso:</span>
                        <span className="text-gray-700 font-medium">{ticket.resource_name} ({ticket.building || 'Piso'} - {ticket.floor}º)</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-semibold">Reportado por:</span>
                      <span className="text-gray-700 font-medium">{ticket.reporter_name} ({ticket.reporter_email})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Atribuído a:</span>
                      <span className="text-gray-700 font-medium">{ticket.assignee_name || 'Ninguém (Pendente)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Data:</span>
                      <span className="text-gray-700 font-medium">{new Date(ticket.created_at).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  </div>

                  {ticket.resolution_notes && (
                    <div className="bg-success-soft/30 border border-success-light/50 rounded-lg p-3 text-xs mb-4">
                      <span className="block font-bold text-success-hover mb-1">Nota de Resolução:</span>
                      <p className="text-gray-700">{ticket.resolution_notes}</p>
                    </div>
                  )}
                </div>

                {/* Ações de Técnico */}
                {isTechOrAdmin && (
                  <div className="pt-3 border-t border-gray-100 flex gap-2">
                    {ticket.status === 'pending' && (
                      <button
                        onClick={() => handleAssignTicket(ticket.id)}
                        className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2 rounded-lg text-xs transition-colors"
                      >
                        Assumir Ocorrência
                      </button>
                    )}
                    {ticket.status === 'in_progress' && (
                      <button
                        onClick={() => {
                          setResolvingTicketId(ticket.id);
                          setIsResolveModalOpen(true);
                        }}
                        className="flex-1 bg-success hover:bg-success-hover text-white font-bold py-2 rounded-lg text-xs transition-colors"
                      >
                        Marcar como Resolvido
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Criar Ticket */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Reportar Avaria / Ocorrência"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Associação de Recurso (Opcional)</label>
            <select
              value={newTicket.resource_id}
              onChange={(e) => setNewTicket(prev => ({ ...prev, resource_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white font-medium text-gray-700"
            >
              <option value="">-- Geral (Sem recurso específico) --</option>
              {recursos.map(r => (
                <option key={r.id} value={r.id}>{r.name} - {r.building} (Piso {r.floor})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Título do Problema</label>
            <input
              type="text"
              placeholder="Ex: Ecrã do Monitor não liga, Mesa com perna solta"
              value={newTicket.title}
              onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição Detalhada</label>
            <textarea
              rows="4"
              placeholder="Por favor detalhe o problema de forma a ajudar o técnico..."
              value={newTicket.description}
              onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Grau de Urgência</label>
            <div className="grid grid-cols-3 gap-2">
              {['low', 'medium', 'high'].map(u => {
                const colors = {
                  low: newTicket.urgency === 'low' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                  medium: newTicket.urgency === 'medium' ? 'bg-warning-hover text-white border-warning-hover' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                  high: newTicket.urgency === 'high' ? 'bg-admin text-white border-admin' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                };
                const label = { low: 'Baixa', medium: 'Média', high: 'Alta' };
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setNewTicket(prev => ({ ...prev, urgency: u }))}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all ${colors[u]}`}
                  >
                    {label[u]}
                  </button>
                );
              })}
            </div>
            {newTicket.urgency === 'high' && (
              <p className="text-[10px] text-admin font-semibold mt-2 animate-pulse">
                Aviso: Recursos marcados com urgência ALTA serão imediatamente bloqueados em manutenção.
              </p>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-primary-light text-sm"
            >
              Submeter Ocorrência
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Fechar Ticket (Técnico) */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Marcar Ticket como Resolvido"
      >
        <form onSubmit={handleResolveTicket} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notas de Resolução / Reparação</label>
            <textarea
              rows="4"
              placeholder="Descreva o que foi feito para solucionar o problema..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              required
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setIsResolveModalOpen(false);
                setResolvingTicketId(null);
                setResolutionNotes('');
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-colors text-sm"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="flex-1 bg-success hover:bg-success-hover text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-success-light text-sm"
            >
              Confirmar Resolução
            </button>
          </div>
        </form>
      </Modal>
      <Footer /> {/* Rodapé no final da página */}
    </div>
  );
}

export default TicketsDashboard;
