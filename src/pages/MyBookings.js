import React, { useEffect, useState, useContext } from 'react';
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

function MyBookings() {
  const [reservas, setReservas] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [erro, setErro] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reservaEditando, setReservaEditando] = useState(null);
  
  const { logout, token, user } = useContext(AuthContext); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    api.get(`/bookings`)
      .then((response) => setReservas(response.data))
      .catch((error) => {
        console.error("Erro na API:", error);
        setErro("Não foi possível carregar as tuas reservas.");
      });

    api.get(`/resources`)
      .then((response) => setRecursos(response.data))
      .catch((error) => console.error("Erro ao carregar recursos:", error));
  }, [token]);

  const cancelarReserva = async (id, nomeRecurso) => {
    const efetuarCancelamento = async () => {
      try {
        await api.put(`/bookings/${id}/cancel`, {});
        toast.success('Reserva cancelada com sucesso!');
        setReservas(prev => prev.map(r => r.booking_id == id ? { ...r, status: 'cancelled' } : r));
      } catch (error) {
        toast.error('Erro ao cancelar a reserva.');
      }
    };
    
    toast(({ closeToast }) => (
      <div className="flex flex-col">
        <h4 className="font-bold text-gray-800 mb-1 text-base">Cancelar Reserva</h4>
        <p className="text-sm text-gray-600 mb-4">Queres cancelar a reserva para a <b>{nomeRecurso || 'mesa'}</b>?</p>
        <div className="flex gap-2">
          <button onClick={() => { efetuarCancelamento(); closeToast(); }} className="flex-1 bg-admin hover:bg-admin-hover text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors">Sim, Cancelar</button>
          <button onClick={closeToast} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 font-bold py-2 px-3 rounded-lg text-sm transition-colors">Voltar</button>
        </div>
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
    const reserva = reservas.find(r => r.booking_id == idReserva);
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
    .filter(r => r.status === 'confirmed')
    .map(r => ({
      id: r.booking_id,
      title: r.resource_name + (r.extra ? ` (+ ${r.extra.resource_name})` : ''), 
      start: r.start_time.replace(' ', 'T'), 
      end: r.end_time.replace(' ', 'T'),
      backgroundColor: '#2563eb',
      borderColor: '#1d4ed8',
      textColor: '#ffffff',
      extendedProps: { nomeRecurso: r.resource_name, startTime: r.start_time, endTime: r.end_time }
    }));

  const handleEventClick = (clickInfo) => {
    const idReserva = clickInfo.event.id;
    const nomeDoRecurso = clickInfo.event.extendedProps.nomeRecurso;
    
    // Encontrar monitor extra
    const bookingObj = reservas.find(r => r.booking_id == idReserva);
    const extraText = bookingObj && bookingObj.extra ? ` + ${bookingObj.extra.resource_name}` : '';
    
    // Verificar se a reserva está a decorrer agora
    const now = new Date();
    const startTime = new Date(clickInfo.event.extendedProps.startTime);
    const endTime = new Date(clickInfo.event.extendedProps.endTime);
    const isOngoing = now >= startTime && now < endTime;

    toast(({ closeToast }) => (
      <div className="flex flex-col">
        <h4 className="font-bold text-gray-800 mb-1 text-base">Gerir Reserva</h4>
        <p className="text-sm text-gray-600 mb-4">O que pretendes fazer com a reserva de <b>{nomeDoRecurso}{extraText}</b>?</p>
        
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
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar user={user} logout={handleLogout} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">As Minhas Reservas</h2>
          <div className="flex items-center gap-2 bg-primary-soft text-primary-hover px-4 py-2 rounded-lg text-sm border border-primary-light shadow-sm animate-fade-in">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span><strong>Dica:</strong> Clica numa reserva do calendário para a editar ou cancelar.</span>
          </div>
        </div>
        
        {erro && <div className="bg-admin-soft text-admin p-4 rounded-lg mb-6">{erro}</div>}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-hidden">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            locales={[ptLocale]}
            locale="pt"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,listWeek,timeGridDay' }}
            events={eventosCalendario}
            eventClick={handleEventClick} 
            height="75vh"
            eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
            slotEventOverlap={false}
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: false, hour12: false }}
            buttonText={{ today: 'Hoje', month: 'Mês', listWeek: 'Semana', day: 'Dia' }}
          />
        </div>
      </main>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Reserva" maxWidth="max-w-md">
        {reservaEditando && <BookingForm booking={reservaEditando} resources={recursos} onSubmit={atualizarReserva} onChange={setReservaEditando} onCancel={() => setIsEditModalOpen(false)} />}
      </Modal>
    </div>
  );
}

export default MyBookings;