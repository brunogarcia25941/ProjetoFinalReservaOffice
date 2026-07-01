import React, { useEffect, useState, useContext, useRef } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptLocale from '@fullcalendar/core/locales/pt';
import listPlugin from '@fullcalendar/list';
import Navbar from '../components/layout/Navbar';
import Modal from '../components/ui/Modal';
import BookingForm from '../components/forms/BookingForm';
import Footer from '../components/layout/Footer';

const gerarLinkGoogleCalendar = (reserva) => {
  if (!reserva) return '';

  const formatarDataGoogle = (dataStr) => {
    const d = new Date(dataStr.replace(' ', 'T'));

    const ano = d.getUTCFullYear();
    const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dia = String(d.getUTCDate()).padStart(2, '0');
    const horas = String(d.getUTCHours()).padStart(2, '0');
    const minutos = String(d.getUTCMinutes()).padStart(2, '0');
    const segundos = String(d.getUTCSeconds()).padStart(2, '0');

    return `${ano}${mes}${dia}T${horas}${minutos}${segundos}Z`;
  };

  const startG = formatarDataGoogle(reserva.start_time);
  const endG = formatarDataGoogle(reserva.end_time);

  const titulo = encodeURIComponent(`Reserva: ${reserva.resource_name}`);
  const datas = `${startG}/${endG}`;
  const localizacao = encodeURIComponent(`${reserva.resource_name} - Escritório`);
  const detalhes = encodeURIComponent(`Reserva realizada através do portal Reserva Office.\nRecurso: ${reserva.resource_name} (${reserva.resource_type})`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${datas}&details=${detalhes}&location=${localizacao}`;
};

function MyBookings() {
  const [reservas, setReservas] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [erro, setErro] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reservaEditando, setReservaEditando] = useState(null);
  const [vistaAtiva, setVistaAtiva] = useState(window.innerWidth < 768 ? 'lista' : 'calendario');
  const calendarRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Efeito para ajustar a vista do FullCalendar com base no tamanho do ecrã
  useEffect(() => {
    const handleResize = () => {
      if (vistaAtiva === 'calendario' && calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        if (calendarApi) {
          if (window.innerWidth < 768) {
            calendarApi.changeView('listWeek');
          } else {
            calendarApi.changeView('dayGridMonth');
          }
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [vistaAtiva]);

  const { logout, token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    // Função para buscar dados da API com controlo do estado de loading apenas na primeira carga
    const buscarDados = async (primeiraCarga = false) => {
      if (primeiraCarga) {
        setLoading(true);
      }
      try {
        const [bookingsRes, resourcesRes] = await Promise.all([
          api.get('/bookings'),
          api.get('/resources')
        ]);
        setReservas(bookingsRes.data);
        setRecursos(resourcesRes.data);
      } catch (error) {
        console.error("Erro ao carregar reservas:", error);
        setErro("Não foi possível carregar as tuas reservas.");
      } finally {
        if (primeiraCarga) {
          setLoading(false);
        }
      }
    };

    buscarDados(true);
    const interval = setInterval(() => buscarDados(false), 10000);
    return () => clearInterval(interval);
  }, [token]);

  const cancelarReserva = async (id, nomeRecurso) => {
    const bookingObj = reservas.find(r => Number(r.booking_id) === Number(id));
    const isRecurring = bookingObj && bookingObj.recurrence_group_id;

    const efetuarCancelamento = async (scope = 'single') => {
      try {
        await api.put(`/bookings/${id}/cancel?scope=${scope}`, {});
        toast.success(scope === 'series' ? 'Série de reservas cancelada com sucesso!' : 'Reserva cancelada com sucesso!');
        if (scope === 'series' && bookingObj) {
          setReservas(prev => prev.map(r => r.recurrence_group_id === bookingObj.recurrence_group_id ? { ...r, status: 'cancelled' } : r));
        } else {
          setReservas(prev => prev.map(r => Number(r.booking_id) === Number(id) ? { ...r, status: 'cancelled' } : r));
        }
      } catch (error) {
        toast.error('Erro ao cancelar a reserva.');
      }
    };

    toast(({ closeToast }) => (
      <div className="flex flex-col text-left">
        <h4 className="font-bold text-gray-800 mb-1 text-base">Cancelar Reserva</h4>
        <p className="text-sm text-gray-600 mb-4">Queres cancelar a reserva para a <b>{nomeRecurso || 'mesa'}</b>?</p>

        {isRecurring ? (
          <div className="flex flex-col gap-2">
            <button onClick={() => { efetuarCancelamento('single'); closeToast(); }} className="w-full bg-admin hover:bg-admin-hover text-white font-bold py-2 rounded-lg text-sm transition-colors">
              Cancelar Apenas Esta Ocorrência
            </button>
            <button onClick={() => { efetuarCancelamento('series'); closeToast(); }} className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2 rounded-lg text-sm transition-colors">
              Cancelar Toda a Série Recorrente
            </button>
            <button onClick={closeToast} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 font-bold py-2 rounded-lg text-sm transition-colors">
              Voltar
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { efetuarCancelamento('single'); closeToast(); }} className="flex-1 bg-admin hover:bg-admin-hover text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors">Sim, Cancelar</button>
            <button onClick={closeToast} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 font-bold py-2 px-3 rounded-lg text-sm transition-colors">Voltar</button>
          </div>
        )}
      </div>
    ), { autoClose: false, closeOnClick: false, draggable: false, position: "top-center", theme: "light" });
  };

  const terminarReservaCedo = async (id, nomeRecurso) => {
    const efetuarTermino = async () => {
      try {
        await api.put(`/bookings/${id}/end`);
        toast.success('Reserva terminada com sucesso! Obrigado por libertar o recurso.');
        // Recarregar reservas do servidor para atualizar as horas corretas no calendário
        const response = await api.get('/bookings');
        setReservas(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao terminar a reserva.');
      }
    };

    toast(({ closeToast }) => (
      <div className="flex flex-col">
        <h4 className="font-bold text-gray-800 mb-1 text-base">Terminar Reserva</h4>
        <p className="text-sm text-gray-600 mb-4">Queres terminar a tua reserva na <b>{nomeRecurso}</b> agora para libertar o espaço?</p>
        <div className="flex gap-2">
          <button onClick={() => { efetuarTermino(); closeToast(); }} className="flex-1 bg-success hover:bg-success-hover text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors">Sim, Terminar Agora</button>
          <button onClick={closeToast} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 font-bold py-2 px-3 rounded-lg text-sm transition-colors">Voltar</button>
        </div>
      </div>
    ), { autoClose: false, closeOnClick: false, draggable: false, position: "top-center", theme: "light" });
  };

  const abrirModalEdicao = (idReserva) => {
    const reserva = reservas.find(r => Number(r.booking_id) === Number(idReserva));
    if (reserva) {
      setReservaEditando({
        ...reserva,
        start_time: reserva.start_time.replace(' ', 'T').substring(0, 16),
        end_time: reserva.end_time.replace(' ', 'T').substring(0, 16),
        extra_resource_id: reserva.extra ? reserva.extra.resource_id : null
      });
      setIsEditModalOpen(true);
    }
  };

  const atualizarReserva = async (e) => {
    e.preventDefault();
    const start = new Date(reservaEditando.start_time);
    const end = new Date(reservaEditando.end_time);

    // Validar se data de fim é posterior à data de início
    if (start >= end) {
      toast.error("A data de fim deve ser posterior à data de início.");
      return;
    }

    // Validar se a duração da reserva não excede 1 mês
    const maxEndDate = new Date(start);
    maxEndDate.setMonth(maxEndDate.getMonth() + 1);
    if (end > maxEndDate) {
      toast.error("A duração da reserva não pode exceder o período máximo de 1 mês!");
      return;
    }

    // Validar se a antecedência não excede 1 mês no futuro
    const agora = new Date();
    const limiteFuturo = new Date(agora);
    limiteFuturo.setMonth(limiteFuturo.getMonth() + 1);
    if (start > limiteFuturo) {
      toast.error("Não é possível alterar a reserva para uma data com mais de 1 mês de antecedência!");
      return;
    }

    try {
      const startFormatado = reservaEditando.start_time.replace('T', ' ') + ':00';
      const endFormatado = reservaEditando.end_time.replace('T', ' ') + ':00';
      const guestEmails = (reservaEditando.guests || []).map(g => typeof g === 'string' ? g : g.email);
      await api.put(`/bookings/${reservaEditando.booking_id}`, {
        resource_id: reservaEditando.resource_id,
        start_time: startFormatado,
        end_time: endFormatado,
        guests: guestEmails,
        extra_resource_id: reservaEditando.extra_resource_id
      });
      toast.success("Reserva atualizada com sucesso!");
      setIsEditModalOpen(false);
      const response = await api.get(`/bookings`);
      setReservas(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao atualizar reserva.");
    }
  };

  const eventosCalendario = reservas
    .filter(r => r.status === 'confirmed' || r.status === 'completed')
    .map(r => ({
      id: r.booking_id,
      title: r.resource_name + (r.extra ? ` (+ ${r.extra.resource_name})` : '') + (r.status === 'completed' ? ' (Concluída)' : ''),
      start: r.start_time.replace(' ', 'T'),
      end: r.end_time.replace(' ', 'T'),
      backgroundColor: r.status === 'completed' ? '#9ca3af' : '#2563eb', // cinza para concluída
      borderColor: r.status === 'completed' ? '#6b7280' : '#1d4ed8',
      textColor: '#ffffff',
      extendedProps: { nomeRecurso: r.resource_name, startTime: r.start_time, endTime: r.end_time, status: r.status }
    }));

  const handleEventClick = (clickInfo) => {
    const idReserva = clickInfo.event.id;
    const nomeDoRecurso = clickInfo.event.extendedProps.nomeRecurso;

    // Encontrar monitor extra
    const bookingObj = reservas.find(r => Number(r.booking_id) === Number(idReserva));
    const extraText = bookingObj && bookingObj.extra ? ` + ${bookingObj.extra.resource_name}` : '';

    // Se a reserva já foi concluída
    if (bookingObj && bookingObj.status === 'completed') {
      toast(({ closeToast }) => (
        <div className="flex flex-col animate-fade-in text-left">
          <h4 className="font-bold text-gray-800 mb-1 text-base">Visualizar Reserva</h4>
          <p className="text-sm text-gray-600 mb-4">A tua reserva para a <b>{nomeDoRecurso}{extraText}</b> está concluída.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-xs text-gray-500">
            <p className="mb-1"><strong>Início:</strong> {new Date(bookingObj.start_time.replace(' ', 'T')).toLocaleString('pt-PT')}</p>
            <p className="mb-1"><strong>Fim:</strong> {new Date(bookingObj.end_time.replace(' ', 'T')).toLocaleString('pt-PT')}</p>
            <p className="mt-2 text-success font-semibold flex items-center gap-1.5 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-success inline-block"></span> Estado: Concluída
            </p>
          </div>
          <a
            href={gerarLinkGoogleCalendar(bookingObj)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeToast}
            className="w-full mb-2 bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-2 rounded-lg text-sm transition-colors block text-center shadow-sm flex items-center justify-center gap-2"
          >
            <span>Adicionar ao Google Calendar</span>
          </a>
          <button onClick={closeToast} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 font-bold py-2 rounded-lg text-sm transition-colors">Fechar</button>
        </div>
      ), { autoClose: false, closeOnClick: false, draggable: false, position: "top-center", theme: "light" });
      return;
    }

    // Verificar se a reserva está a decorrer agora
    const now = new Date();
    const startTime = new Date(clickInfo.event.extendedProps.startTime);
    const endTime = new Date(clickInfo.event.extendedProps.endTime);
    const isOngoing = now >= startTime && now < endTime;

    toast(({ closeToast }) => (
      <div className="flex flex-col text-left">
        <h4 className="font-bold text-gray-800 mb-1 text-base">Gerir Reserva</h4>
        <p className="text-sm text-gray-600 mb-4">O que pretendes fazer com a reserva de <b>{nomeDoRecurso}{extraText}</b>?</p>

        <a
          href={gerarLinkGoogleCalendar(bookingObj)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={closeToast}
          className="w-full mb-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors block text-center shadow-sm flex items-center justify-center gap-2"
        >
          <span>Adicionar ao Google Calendar</span>
        </a>

        {isOngoing && (
          <button onClick={() => { closeToast(); terminarReservaCedo(idReserva, nomeDoRecurso); }} className="w-full mb-2 bg-success hover:bg-success-hover text-white font-bold py-2 rounded-lg text-sm transition-colors">
            Concluir / Libertar Espaço
          </button>
        )}

        <div className="flex gap-2">
          <button onClick={() => { closeToast(); abrirModalEdicao(idReserva); }} className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2 rounded-lg text-sm transition-colors">Editar</button>
          <button onClick={() => { closeToast(); cancelarReserva(idReserva, nomeDoRecurso); }} className="flex-1 bg-admin hover:bg-admin-hover text-white font-bold py-2 rounded-lg text-sm transition-colors">Cancelar</button>
        </div>
        <button onClick={closeToast} className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 font-bold py-2 rounded-lg text-sm transition-colors">Voltar</button>
      </div>
    ), { autoClose: false, closeOnClick: false, draggable: false, position: "top-center", theme: "light" });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <style>{`
        @media (max-width: 640px) {
          .fc .fc-toolbar {
            flex-direction: column !important;
            gap: 0.75rem !important;
            align-items: center !important;
          }
          .fc .fc-toolbar-title {
            font-size: 1.15rem !important;
            font-weight: 800 !important;
          }
          .fc .fc-button-group {
            display: flex !important;
            width: 100% !important;
          }
          .fc .fc-button {
            flex: 1 !important;
            padding: 0.35rem 0.5rem !important;
            font-size: 0.75rem !important;
          }
          .fc .fc-today-button {
            width: 100% !important;
            padding: 0.35rem 0.5rem !important;
            font-size: 0.75rem !important;
          }
        }
      `}</style>

      <Navbar user={user} logout={handleLogout} />

      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">As Minhas Reservas</h2>
          <div className="flex items-center gap-2 bg-primary-soft text-primary-hover px-4 py-2 rounded-lg text-sm border border-primary-light shadow-sm animate-fade-in">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span><strong>Dica:</strong> {vistaAtiva === 'calendario' ? 'Clica numa reserva do calendário para a editar ou cancelar.' : 'Usa os botões nos cartões para gerir as tuas reservas.'}</span>
          </div>
        </div>

        {/* Segmented Control para Alternar Vistas */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex shadow-sm border border-gray-200">
            <button
              onClick={() => setVistaAtiva('calendario')}
              className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${vistaAtiva === 'calendario' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Calendário
            </button>
            <button
              onClick={() => setVistaAtiva('lista')}
              className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${vistaAtiva === 'lista' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Lista de Reservas
            </button>
          </div>
        </div>

        {erro && <div className="bg-admin-soft text-admin p-4 rounded-lg mb-6">{erro}</div>}

        {/* Ecrã de carregamento ativo se for a primeira carga */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500 font-semibold bg-white border border-gray-200 rounded-xl shadow-sm">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>A carregar as tuas reservas e recursos...</span>
          </div>
        ) : vistaAtiva === 'calendario' ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-hidden">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView={window.innerWidth < 768 ? 'listWeek' : 'dayGridMonth'}
              locales={[ptLocale]}
              locale="pt"
              headerToolbar={window.innerWidth < 640 ? { left: 'prev,next', center: 'title', right: 'today' } : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,listWeek,timeGridDay' }}
              events={eventosCalendario}
              eventClick={handleEventClick}
              height="75vh"
              eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
              slotEventOverlap={false}
              eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: false, hour12: false }}
              buttonText={{ today: 'Hoje', month: 'Mês', listWeek: 'Semana', day: 'Dia' }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {reservas.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500 shadow-sm">
                Não tens nenhuma reserva registada no sistema.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reservas.map(reserva => {
                  const dataInicio = new Date(reserva.start_time.replace(' ', 'T')).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
                  const dataFim = new Date(reserva.end_time.replace(' ', 'T')).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
                  const isCompleted = reserva.status === 'completed';
                  const isCancelled = reserva.status === 'cancelled';
                  const isConfirmed = reserva.status === 'confirmed';

                  const now = new Date();
                  const startTime = new Date(reserva.start_time.replace(' ', 'T'));
                  const endTime = new Date(reserva.end_time.replace(' ', 'T'));
                  const isOngoing = now >= startTime && now < endTime;

                  const extraText = reserva.extra ? ` + ${reserva.extra.resource_name}` : '';

                  return (
                    <div
                      key={reserva.booking_id}
                      className={`bg-white border rounded-xl p-5 shadow-sm transition-all flex flex-col justify-between hover:shadow-md ${isCancelled ? 'border-gray-200 opacity-60 bg-gray-50/50' : isCompleted ? 'border-green-200 bg-green-50/10' : 'border-blue-200 bg-blue-50/5'}`}
                    >
                      <div className="text-left">
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <div>
                            <span className="font-extrabold text-gray-900 text-lg block">{reserva.resource_name}{extraText}</span>
                            <span className="text-xs text-gray-400 capitalize font-medium">{reserva.resource_type}</span>
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border whitespace-nowrap ${isConfirmed ? 'bg-blue-50 text-blue-600 border-blue-100' : isCompleted ? 'bg-success-light text-success-hover border-success-light' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                            {isConfirmed ? 'Confirmada' : isCompleted ? 'Concluída' : 'Cancelada'}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-sm text-gray-600 mb-4 bg-gray-50/80 rounded-lg p-3 border border-gray-100">
                          <p className="flex justify-between"><strong>Início:</strong> <span>{dataInicio}</span></p>
                          <p className="flex justify-between"><strong>Fim:</strong> <span>{dataFim}</span></p>
                        </div>
                      </div>

                      {isConfirmed && (
                        <div className="space-y-2 border-t border-gray-100 pt-3 text-left">
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={gerarLinkGoogleCalendar(reserva)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 min-w-[120px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 rounded-lg text-xs transition-colors text-center block flex items-center justify-center gap-1 border border-indigo-100"
                            >
                              Google Cal
                            </a>
                            <button
                              onClick={() => abrirModalEdicao(reserva.booking_id)}
                              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2 rounded-lg text-xs transition-colors border border-gray-200"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => cancelarReserva(reserva.booking_id, reserva.resource_name)}
                              className="flex-1 bg-admin-soft hover:bg-admin-soft/80 text-admin font-bold py-2 rounded-lg text-xs transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>

                          {isOngoing && (
                            <button
                              onClick={() => terminarReservaCedo(reserva.booking_id, reserva.resource_name)}
                              className="w-full bg-success hover:bg-success-hover text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm"
                            >
                              Concluir / Libertar Agora
                            </button>
                          )}
                        </div>
                      )}

                      {isCompleted && (
                        <div className="border-t border-gray-100 pt-3 flex gap-2 text-left">
                          <a
                            href={gerarLinkGoogleCalendar(reserva)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 rounded-lg text-xs transition-colors text-center block flex items-center justify-center gap-1 border border-indigo-100"
                          >
                            Adicionar ao Google Calendar
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Reserva" maxWidth="max-w-md">
        {reservaEditando && <BookingForm booking={reservaEditando} resources={recursos} onSubmit={atualizarReserva} onChange={setReservaEditando} onCancel={() => setIsEditModalOpen(false)} />}
      </Modal>
      <Footer /> {/* Rodapé no final da página */}
    </div>
  );
}

export default MyBookings;