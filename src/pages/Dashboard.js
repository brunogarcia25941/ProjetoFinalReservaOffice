import React, { useEffect, useState, useContext, useCallback } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import PlantaEditor from '../components/PlantaEditor';
import Navbar from '../components/layout/Navbar';
import SidebarFilters from '../components/layout/SidebarFilters';
import Modal from '../components/ui/Modal';
import GuestInput from '../components/forms/GuestInput';
import Footer from '../components/layout/Footer';

const formatarDataGoogle = (dataStr) => {
  if (!dataStr) return '';
  const d = new Date(dataStr.replace(' ', 'T'));
  const ano = d.getUTCFullYear();
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(d.getUTCDate()).padStart(2, '0');
  const horas = String(d.getUTCHours()).padStart(2, '0');
  const minutos = String(d.getUTCMinutes()).padStart(2, '0');
  const segundos = String(d.getUTCSeconds()).padStart(2, '0');
  return `${ano}${mes}${dia}T${horas}${minutos}${segundos}Z`;
};

const gerarLinkGoogle = (nomeRecurso, tipoRecurso, startStr, endStr) => {
  const startG = formatarDataGoogle(startStr);
  const endG = formatarDataGoogle(endStr);
  const titulo = encodeURIComponent(`Reserva: ${nomeRecurso}`);
  const datas = `${startG}/${endG}`;
  const localizacao = encodeURIComponent(`${nomeRecurso} - Escritório`);
  const detalhes = encodeURIComponent(`Reserva realizada através do portal Reserva Office.\nRecurso: ${nomeRecurso} (${tipoRecurso})`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${datas}&details=${detalhes}&location=${localizacao}`;
};

function Dashboard() {
  const [recursos, setRecursos] = useState([]);
  const [erro, setErro] = useState(null);
  const [pisoFiltro, setPisoFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [tiposDesmarcados, setTiposDesmarcados] = useState([]);
  const [apenasAcessiveis, setApenasAcessiveis] = useState(false);
  const [isRoomBookingModalOpen, setIsRoomBookingModalOpen] = useState(false);
  const [roomBookingData, setRoomBookingData] = useState(null);
  const [isDeskBookingModalOpen, setIsDeskBookingModalOpen] = useState(false);
  const [deskBookingData, setDeskBookingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const hoje = new Date().toISOString().split('T')[0];
  const [dataInicio, setDataInicio] = useState(`${hoje}T09:00`);
  const [dataFim, setDataFim] = useState(`${hoje}T18:00`);

  const [atalhoAtivo, setAtalhoAtivo] = useState(null);
  const [numHoras, setNumHoras] = useState(2);
  const [vista, setVista] = useState('grelha');

  const { logout, token, user, selectedOffice } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatMySQLDate = (htmlDate) => htmlDate.replace('T', ' ') + ':00';
  const getLocalISOString = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date - offset)).toISOString().slice(0, 16);
  };

  const aplicarAtalho = (tipo, horasPersonalizadas = numHoras) => {
    let inicio = new Date();
    let fim = new Date();
    setAtalhoAtivo(tipo);

    if (tipo === 'resto_hoje') {
      if (inicio.getHours() < 9) inicio.setHours(9, 0, 0);
      fim.setHours(18, 0, 0);
    } else if (tipo === 'proximas_h') {
      if (inicio.getHours() < 9) inicio.setHours(9, 0, 0);
      fim = new Date(inicio.getTime() + horasPersonalizadas * 60 * 60 * 1000);
      if (fim.getHours() >= 18) fim.setHours(18, 0, 0);
    } else if (tipo === 'amanha') {
      inicio.setDate(inicio.getDate() + 1);
      inicio.setHours(9, 0, 0);
      fim = new Date(inicio);
      fim.setHours(18, 0, 0);
    } else if (tipo === 'semana') {
      inicio.setHours(9, 0, 0);
      const diasParaSexta = 5 - fim.getDay();
      fim.setDate(fim.getDate() + (diasParaSexta >= 0 ? diasParaSexta : 6));
      fim.setHours(18, 0, 0);
    }

    setDataInicio(getLocalISOString(inicio));
    setDataFim(getLocalISOString(fim));
  };

  const horaInicio = new Date(dataInicio).getHours();
  const horaFim = new Date(dataFim).getHours();
  const minFim = new Date(dataFim).getMinutes();
  const isForaDeHoras = horaInicio < 9 || horaFim > 18 || (horaFim === 18 && minFim > 0);

  const carregarRecursosComDisponibilidade = useCallback(async () => {
    if (!token || !dataInicio || !dataFim) return;
    setIsLoading(true);
    setErro(null);
    const startTimeFormatado = formatMySQLDate(dataInicio);
    const endTimeFormatado = formatMySQLDate(dataFim);

    if (new Date(startTimeFormatado) >= new Date(endTimeFormatado) || isForaDeHoras) {
      setRecursos([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get(`/resources/availability`, {
        params: { start: startTimeFormatado, end: endTimeFormatado }
      });
      setRecursos(response.data);
    } catch (error) {
      setErro("Não foi possível carregar a disponibilidade dos recursos.");
    } finally {
      setIsLoading(false);
    }
  }, [token, dataInicio, dataFim, isForaDeHoras]);

  useEffect(() => {
    carregarRecursosComDisponibilidade();
    const interval = setInterval(() => {
      carregarRecursosComDisponibilidade();
    }, 10000);
    return () => clearInterval(interval);
  }, [carregarRecursosComDisponibilidade]);

  useEffect(() => {
    setPisoFiltro('');
  }, [selectedOffice]);

  const confirmarReservaSala = async (e) => {
    e.preventDefault();
    if (!roomBookingData) return;

    try {
      const payload = {
        resource_id: roomBookingData.id,
        start_time: roomBookingData.start_time,
        end_time: roomBookingData.end_time,
        guests: roomBookingData.guests
      };

      if (roomBookingData.isRecurring && roomBookingData.recurrenceType && roomBookingData.recurrenceEndDate) {
        payload.recurrence = {
          type: roomBookingData.recurrenceType,
          endDate: roomBookingData.recurrenceEndDate + ' 23:59:59'
        };
      }

      await api.post(`/bookings`, payload);
      const gLink = gerarLinkGoogle(roomBookingData.name, 'room', roomBookingData.start_time, roomBookingData.end_time);
      toast.success(({ closeToast }) => (
        <div className="flex flex-col text-left">
          <span>Reserva para <b>{roomBookingData.name}</b> efetuada com sucesso!</span>
          <a
            href={gLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeToast}
            className="mt-2 text-xs text-white bg-indigo-600 hover:bg-indigo-700 font-bold py-1.5 px-3 rounded-lg text-center inline-block transition-colors"
          >
            Adicionar ao Google Calendar
          </a>
        </div>
      ), { autoClose: 8000 });

      setIsRoomBookingModalOpen(false);
      setRoomBookingData(null);
      carregarRecursosComDisponibilidade();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao tentar reservar a sala.");
    }
  };

  const confirmarReservaMesa = async (e) => {
    e.preventDefault();
    if (!deskBookingData) return;

    try {
      const payload = {
        resource_id: deskBookingData.id,
        start_time: deskBookingData.start_time,
        end_time: deskBookingData.end_time
      };

      if (deskBookingData.hasExtra && deskBookingData.extra_resource_id) {
        payload.extra_resource_id = deskBookingData.extra_resource_id;
      }

      if (deskBookingData.isRecurring && deskBookingData.recurrenceType && deskBookingData.recurrenceEndDate) {
        payload.recurrence = {
          type: deskBookingData.recurrenceType,
          endDate: deskBookingData.recurrenceEndDate + ' 23:59:59'
        };
      }

      await api.post(`/bookings`, payload);
      const deskObj = recursos.find(r => r.id === deskBookingData.id);
      const deskName = deskObj ? deskObj.name : 'Mesa';
      const gLink = gerarLinkGoogle(deskName, 'desk', deskBookingData.start_time, deskBookingData.end_time);
      toast.success(({ closeToast }) => (
        <div className="flex flex-col text-left">
          <span>Reserva para <b>{deskName}</b> efetuada com sucesso!</span>
          <a
            href={gLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeToast}
            className="mt-2 text-xs text-white bg-indigo-600 hover:bg-indigo-700 font-bold py-1.5 px-3 rounded-lg text-center inline-block transition-colors"
          >
            Adicionar ao Google Calendar
          </a>
        </div>
      ), { autoClose: 8000 });

      setIsDeskBookingModalOpen(false);
      setDeskBookingData(null);
      carregarRecursosComDisponibilidade();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao tentar reservar a mesa.");
    }
  };

  const reservarRecurso = async (id, nome) => {
    if (!dataInicio || !dataFim) {
      toast.warn("Por favor, seleciona a data e hora de início e de fim no menu lateral.");
      return;
    }
    const startTimeFormatado = formatMySQLDate(dataInicio);
    const endTimeFormatado = formatMySQLDate(dataFim);

    if (new Date(startTimeFormatado) >= new Date(endTimeFormatado)) {
      toast.error("Atenção: A data/hora de fim tem de ser depois da data/hora de início!");
      return;
    }

    const start = new Date(startTimeFormatado.replace(' ', 'T'));
    const end = new Date(endTimeFormatado.replace(' ', 'T'));

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
      toast.error("Não é possível criar reservas com mais de 1 mês de antecedência!");
      return;
    }

    const recursoObj = recursos.find(r => r.id === id);
    const isRoom = recursoObj && recursoObj.type === 'room';
    const isDesk = recursoObj && recursoObj.type === 'desk';

    if (isRoom) {
      setRoomBookingData({
        id,
        name: nome,
        start_time: startTimeFormatado,
        end_time: endTimeFormatado,
        guests: []
      });
      setIsRoomBookingModalOpen(true);
      return;
    }

    if (isDesk) {
      setDeskBookingData({
        id,
        name: nome,
        start_time: startTimeFormatado,
        end_time: endTimeFormatado,
        extra_resource_id: null,
        hasExtra: false
      });
      setIsDeskBookingModalOpen(true);
      return;
    }

    const efetuarReservaApi = async () => {
      try {
        await api.post(`/bookings`, { resource_id: id, start_time: startTimeFormatado, end_time: endTimeFormatado });
        toast.success(`Reserva para ${nome} efetuada com sucesso!`);
        carregarRecursosComDisponibilidade();
      } catch (error) {
        toast.error(error.response?.data?.message || "Erro ao tentar reservar a mesa.");
      }
    };

    toast(({ closeToast }) => (
      <div className="flex flex-col">
        <h4 className="font-bold text-gray-800 mb-1 text-base">Confirmar Reserva</h4>
        <p className="text-sm text-gray-600 mb-3">Queres reservar a <b>{nome}</b>?</p>
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-4 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Início</span>
            <span className="text-xs font-semibold text-gray-800">{new Date(startTimeFormatado.replace(' ', 'T')).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Fim</span>
            <span className="text-xs font-semibold text-gray-800">{new Date(endTimeFormatado.replace(' ', 'T')).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { efetuarReservaApi(); closeToast(); }} className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors">Confirmar</button>
          <button onClick={closeToast} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 font-bold py-2 px-3 rounded-lg text-sm transition-colors">Cancelar</button>
        </div>
      </div>
    ), { autoClose: false, closeOnClick: false, draggable: false, position: "top-center", theme: "light" });
  };

  const sugerirLugarAcessivel = () => {
    // Procurar recursos ativos e não reservados que tenham accessible: true
    const disponiveisAcessiveis = recursosDoOffice.filter(r => {
      const isMaintenance = r.status === 'maintenance';
      const isAlreadyBooked = r.is_booked === 1;
      const isAvailable = !isMaintenance && !isAlreadyBooked;
      if (!isAvailable) return false;

      let featuresObj = {};
      if (r.features) {
        try {
          featuresObj = typeof r.features === 'string' ? JSON.parse(r.features) : r.features;
        } catch (e) {
          return false;
        }
      }
      return !!featuresObj.accessible;
    });

    if (disponiveisAcessiveis.length === 0) {
      toast.info("De momento, não existem lugares acessíveis (PMR) livres neste edifício para o horário selecionado.");
      return;
    }

    // Sugerir o primeiro disponível
    const sugerido = disponiveisAcessiveis[0];

    toast(({ closeToast }) => (
      <div className="flex flex-col">
        <h4 className="font-bold text-gray-800 mb-1 text-base flex items-center gap-1.5">
          <span>♿ Sugestão de Lugar Acessível</span>
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Sugerimos a <b>{sugerido.name}</b> (Piso {sugerido.floor}) que está livre e adaptada a PMR.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              closeToast();
              reservarRecurso(sugerido.id, sugerido.name);
            }}
            className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors"
          >
            Reservar
          </button>
          <button onClick={closeToast} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 font-bold py-2 px-3 rounded-lg text-sm transition-colors">Voltar</button>
        </div>
      </div>
    ), { autoClose: false, closeOnClick: false, draggable: false, position: "top-center", theme: "light" });
  };

  const recursosDoOffice = recursos.filter(r => !selectedOffice || r.building === selectedOffice);
  const pisosDisponiveis = [...new Set(recursosDoOffice.map(r => r.floor))].filter(Boolean).sort();
  const tiposDisponiveis = [...new Set(recursosDoOffice.map(r => r.type))].filter(Boolean).sort();
  const traduzirTipo = (tipo) => {
    const traducoes = {
      desk: 'Mesas',
      room: 'Salas de Reunião',
      monitor: 'Monitores',
      mouse: 'Ratos',
      keyboard: 'Teclados',
      headphones: 'Auscultadores / Fones',
      hdmi_cable: 'Cabos HDMI',
      network_cable: 'Cabos de Rede',
      webcam: 'Webcams',
      hdmi_vga_adapter: 'Adaptadores HDMI para VGA',
      pc_charger: 'Carregadores de PC'
    };
    return traducoes[tipo] || tipo;
  };

  const recursosFiltrados = recursosDoOffice.filter((r) => {
    const passaPiso = pisoFiltro === '' || String(r.floor) === String(pisoFiltro);
    const isMaintenance = r.status === 'maintenance';
    const isAlreadyBooked = r.is_booked === 1;
    const isAvailable = !isMaintenance && !isAlreadyBooked;
    let passaStatus = true;
    if (statusFiltro === 'disponivel') passaStatus = isAvailable;
    else if (statusFiltro === 'ocupado') passaStatus = isAlreadyBooked && !isMaintenance;
    else if (statusFiltro === 'manutencao') passaStatus = isMaintenance;
    const passaTipo = !tiposDesmarcados.includes(r.type);

    // Filtro de Acessibilidade
    let passaAcessibilidade = true;
    if (apenasAcessiveis) {
      let featuresObj = {};
      if (r.features) {
        try {
          featuresObj = typeof r.features === 'string' ? JSON.parse(r.features) : r.features;
        } catch (e) { }
      }
      passaAcessibilidade = !!featuresObj.accessible;
    }

    return passaPiso && passaStatus && passaTipo && passaAcessibilidade;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar user={user} logout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 flex-1 w-full">
        <SidebarFilters
          dataInicio={dataInicio} setDataInicio={setDataInicio}
          dataFim={dataFim} setDataFim={setDataFim}
          atalhoAtivo={atalhoAtivo} setAtalhoAtivo={setAtalhoAtivo}
          numHoras={numHoras} setNumHoras={setNumHoras}
          aplicarAtalho={aplicarAtalho}
          pisoFiltro={pisoFiltro} setPisoFiltro={setPisoFiltro}
          pisosDisponiveis={pisosDisponiveis}
          tiposDisponiveis={tiposDisponiveis}
          tiposDesmarcados={tiposDesmarcados} setTiposDesmarcados={setTiposDesmarcados}
          traduzirTipo={traduzirTipo}
          apenasAcessiveis={apenasAcessiveis}
          setApenasAcessiveis={setApenasAcessiveis}
        />

        <main className="flex-1 bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Seleciona um recurso para reservar</h2>
              <p className="text-xs sm:text-sm text-gray-500">A mostrar {recursosFiltrados.length} recurso(s) {pisoFiltro ? `no Piso ${pisoFiltro}` : 'em todos os pisos'}.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={sugerirLugarAcessivel}
                className="bg-primary-soft hover:bg-primary-light text-primary-hover border border-primary-light hover:border-primary transition-all font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Sugerir um lugar acessível disponível"
              >
                <span>♿ Sugerir Lugar Acessível</span>
              </button>
              <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 w-fit">
                <button onClick={() => setVista('grelha')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${vista === 'grelha' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}>Grelha</button>
                <button onClick={() => setVista('mapa')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${vista === 'mapa' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}>Mapa</button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                {['disponivel', 'ocupado', 'manutencao'].map(s => (
                  <button key={s} onClick={() => setStatusFiltro(statusFiltro === s ? 'todos' : s)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${statusFiltro === s ? 'bg-primary-soft border-primary-light shadow-sm text-primary-hover' : 'bg-transparent border-transparent hover:bg-gray-50 text-gray-600'}`}>
                    <span className={`w-3 h-3 rounded-full border ${s === 'disponivel' ? 'bg-success-light border-success' : s === 'ocupado' ? 'bg-gray-200 border-gray-400' : 'bg-admin-light border-admin'}`}></span>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {erro && <div className="bg-admin-soft text-admin p-4 rounded-lg mb-6 text-sm text-center font-medium">{erro}</div>}
          {new Date(dataInicio) >= new Date(dataFim) && (
            <div className="bg-warning-soft text-warning-hover p-8 rounded-lg mb-6 text-center border border-dashed border-warning-light">
              <h4 className="font-bold text-lg">Horário de Reserva Inválido</h4>
              <p className="text-sm mt-1">A hora de fim tem de ser posterior à hora de início.</p>
            </div>
          )}

          {(() => {
            if (!dataInicio || !dataFim) return null;
            const start = new Date(dataInicio);
            const end = new Date(dataFim);
            if (start >= end) return null;

            const maxEndDate = new Date(start);
            maxEndDate.setMonth(maxEndDate.getMonth() + 1);

            const agora = new Date();
            const limiteFuturo = new Date(agora);
            limiteFuturo.setMonth(limiteFuturo.getMonth() + 1);

            if (end > maxEndDate) {
              return (
                <div className="bg-warning-soft text-warning-hover p-8 rounded-lg mb-6 text-center border border-dashed border-warning-light animate-fade-in">
                  <h4 className="font-bold text-lg">Duração Excedida</h4>
                  <p className="text-sm mt-1">A duração máxima permitida para uma reserva é de 1 mês.</p>
                </div>
              );
            }

            if (start > limiteFuturo) {
              return (
                <div className="bg-warning-soft text-warning-hover p-8 rounded-lg mb-6 text-center border border-dashed border-warning-light animate-fade-in">
                  <h4 className="font-bold text-lg">Antecedência Não Permitida</h4>
                  <p className="text-sm mt-1">Não é possível agendar recursos com mais de 1 mês de antecedência.</p>
                </div>
              );
            }

            return null;
          })()}

          {isForaDeHoras && new Date(dataInicio) < new Date(dataFim) && (
            <div className="bg-warning-soft text-warning-hover p-8 rounded-xl mb-6 text-center border border-dashed border-warning-light">
              <h4 className="font-bold text-lg">Fora do Horário De Escritório</h4>
              <p className="text-sm mt-1">O escritório funciona apenas entre as 09:00 e as 18:00.</p>
            </div>
          )}


          {isLoading && !isForaDeHoras && new Date(dataInicio) < new Date(dataFim) && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500 font-semibold animate-fade-in">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>A verificar disponibilidade de recursos...</span>
            </div>
          )}

          {vista === 'mapa' ? (
            <div className="animate-fade-in space-y-4">
              <div className="flex gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100 w-fit">
                {(pisosDisponiveis.length > 0 ? pisosDisponiveis : [1, 2, 3]).map(piso => (
                  <button key={piso} onClick={() => setPisoFiltro(String(piso))} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${String(pisoFiltro || pisosDisponiveis[0] || 1) === String(piso) ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>Piso {piso}</button>
                ))}
              </div>
              <div className="border border-gray-100 rounded-xl overflow-x-auto shadow-inner bg-gray-50 w-full">
                <div className="min-w-[800px] overflow-hidden">
                  <PlantaEditor recursos={recursosFiltrados} modoAdmin={false} reservarRecurso={reservarRecurso} pisoAtual={pisoFiltro || pisosDisponiveis[0] || 1} officeName={selectedOffice} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {[...new Set(recursosFiltrados.map(r => r.type))].map(tipo => (
                <div key={tipo} className="animate-fade-in">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2 capitalize">
                    {traduzirTipo(tipo)}
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full ml-1">{recursosFiltrados.filter(r => r.type === tipo).length}</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                    {recursosFiltrados.filter(r => r.type === tipo).map((recurso) => {
                      const isMaintenance = recurso.status === 'maintenance';
                      const isAlreadyBooked = recurso.is_booked === 1;
                      const isAvailable = !isMaintenance && !isAlreadyBooked;
                      return (
                        <div key={recurso.id} onClick={() => isAvailable && reservarRecurso(recurso.id, recurso.name)} className={`relative p-3 rounded-xl border transition-all flex flex-col items-center text-center ${isAvailable ? 'bg-success-soft/30 border-success-light hover:border-success hover:shadow-sm cursor-pointer hover:-translate-y-1' : 'bg-gray-50/50 border-gray-200 opacity-60 cursor-not-allowed'}`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tickets?resource_id=${recurso.id}`);
                            }}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-admin hover:bg-gray-100 rounded-lg transition-all"
                            title="Reportar Avaria"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                          </button>
                          {recurso.type === 'monitor' ? (
                            <svg className={`w-6 h-6 mb-2 ${isAvailable ? 'text-success' : isAlreadyBooked ? 'text-gray-400' : 'text-admin'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          ) : (
                            <svg className={`w-6 h-6 mb-2 ${isAvailable ? 'text-success' : isAlreadyBooked ? 'text-gray-400' : 'text-admin'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 10h2v5a2 2 0 01-2 2H10a2 2 0 01-2-2v-5h2zm-4 0h4v5h-4v-5zm-6 0h2v5a2 2 0 002 2h0v-5H4v5a2 2 0 01-2-2v-5h2z"></path></svg>
                          )}
                          <span className="font-bold text-xs text-gray-800 truncate w-full mb-1 flex items-center justify-center gap-1">
                            {(() => {
                              let featuresObj = {};
                              if (recurso.features) {
                                try {
                                  featuresObj = typeof recurso.features === 'string' ? JSON.parse(recurso.features) : recurso.features;
                                } catch (e) { }
                              }
                              return !!featuresObj.accessible && <span title="Lugar Acessível (PMR)" className="text-blue-500 font-semibold">♿</span>;
                            })()}
                            {recurso.name}
                          </span>
                          <span className="text-[10px] text-gray-400">Piso {recurso.floor}</span>
                          <span className={`mt-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${isAvailable ? 'bg-success-light text-success-hover' : isMaintenance ? 'bg-admin-light text-admin' : 'bg-gray-100 text-gray-700'}`}>{isAvailable ? 'Livre' : isMaintenance ? 'Em Manutenção' : 'Ocupada'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Modal
        isOpen={isRoomBookingModalOpen}
        onClose={() => { setIsRoomBookingModalOpen(false); setRoomBookingData(null); }}
        title="Confirmar Reserva de Sala"
      >
        {roomBookingData && (
          <form onSubmit={confirmarReservaSala} className="space-y-4">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold uppercase">Sala</span>
                <span className="text-sm font-semibold text-gray-800">{roomBookingData.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold uppercase">Início</span>
                <span className="text-sm font-semibold text-gray-800">
                  {new Date(roomBookingData.start_time.replace(' ', 'T')).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold uppercase">Fim</span>
                <span className="text-sm font-semibold text-gray-800">
                  {new Date(roomBookingData.end_time.replace(' ', 'T')).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <GuestInput
                guests={roomBookingData.guests}
                onChange={(newGuests) => setRoomBookingData(prev => ({ ...prev, guests: newGuests }))}
              />
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-3">
              <div
                className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setRoomBookingData(prev => ({
                  ...prev,
                  isRecurring: !prev.isRecurring,
                  recurrenceType: prev.isRecurring ? '' : 'weekly',
                  recurrenceEndDate: prev.isRecurring ? '' : prev.end_time.substring(0, 10)
                }))}
              >
                <input
                  type="checkbox"
                  checked={!!roomBookingData.isRecurring}
                  onChange={() => { }} // handled by click
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-gray-800">Repetir esta reserva</span>
                  <span className="text-xs text-gray-500">Criar uma série de reuniões recorrentes</span>
                </div>
              </div>

              {roomBookingData.isRecurring && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 animate-fade-in text-left">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Repetição</label>
                    <select
                      value={roomBookingData.recurrenceType}
                      onChange={(e) => setRoomBookingData(prev => ({ ...prev, recurrenceType: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white font-medium text-gray-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="weekly">Semanalmente</option>
                      <option value="daily">Diariamente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Até à data</label>
                    <input
                      type="date"
                      value={roomBookingData.recurrenceEndDate}
                      onChange={(e) => setRoomBookingData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium text-gray-800"
                      onClick={(e) => e.stopPropagation()}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => { setIsRoomBookingModalOpen(false); setRoomBookingData(null); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-primary-light text-sm"
              >
                Confirmar Reserva
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={isDeskBookingModalOpen}
        onClose={() => { setIsDeskBookingModalOpen(false); setDeskBookingData(null); }}
        title="Confirmar Reserva de Mesa"
      >
        {deskBookingData && (() => {
          const deskObj = recursos.find(r => r.id === deskBookingData.id);
          const extrasDisponiveis = deskObj ? recursos.filter(r =>
            ['monitor', 'mouse', 'keyboard', 'headphones', 'hdmi_cable', 'network_cable', 'webcam', 'hdmi_vga_adapter', 'pc_charger'].includes(r.type) &&
            r.status === 'active' &&
            r.is_booked !== 1 &&
            r.building === deskObj.building
          ) : [];

          return (
            <form onSubmit={confirmarReservaMesa} className="space-y-4">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold uppercase">Mesa</span>
                  <span className="text-sm font-semibold text-gray-800">{deskBookingData.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold uppercase">Início</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {new Date(deskBookingData.start_time.replace(' ', 'T')).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold uppercase">Fim</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {new Date(deskBookingData.end_time.replace(' ', 'T')).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div
                  className="flex items-center space-x-3 p-3 bg-primary-soft border border-primary-light rounded-xl cursor-pointer hover:bg-primary-soft/80 transition-colors"
                  onClick={() => setDeskBookingData(prev => {
                    const nextHasExtra = !prev.hasExtra;
                    return {
                      ...prev,
                      hasExtra: nextHasExtra,
                      extra_resource_id: nextHasExtra ? (extrasDisponiveis[0]?.id || null) : null
                    };
                  })}
                >
                  <input
                    type="checkbox"
                    checked={deskBookingData.hasExtra}
                    onChange={() => { }} // handled by click on parent div
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-gray-800">Adicionar Equipamento / Acessório Extra</span>
                    <span className="text-xs text-gray-500">Selecione um periférico ou cabo livre neste edifício</span>
                  </div>
                </div>

                {deskBookingData.hasExtra && (
                  <div className="mt-3 space-y-2 animate-fade-in text-left">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Selecione o Equipamento</label>
                    {extrasDisponiveis.length > 0 ? (
                      <select
                        value={deskBookingData.extra_resource_id || ''}
                        onChange={(e) => setDeskBookingData(prev => ({ ...prev, extra_resource_id: e.target.value ? parseInt(e.target.value) : null }))}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white font-medium text-gray-800"
                      >
                        {extrasDisponiveis.map(m => {
                          const tipoMap = {
                            monitor: 'Monitor',
                            mouse: 'Rato',
                            keyboard: 'Teclado',
                            headphones: 'Fones / Auscultadores',
                            hdmi_cable: 'Cabo HDMI',
                            network_cable: 'Cabo de Rede',
                            webcam: 'Webcam',
                            hdmi_vga_adapter: 'Adaptador HDMI/VGA',
                            pc_charger: 'Carregador de PC'
                          };
                          const labelTipo = tipoMap[m.type] || m.type;
                          return (
                            <option key={m.id} value={m.id}>{m.name} ({labelTipo})</option>
                          );
                        })}
                      </select>
                    ) : (
                      <p className="text-xs font-semibold text-admin bg-admin-soft p-3 rounded-lg">
                        De momento, não existem equipamentos livres neste edifício para o horário selecionado.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div
                  className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setDeskBookingData(prev => ({
                    ...prev,
                    isRecurring: !prev.isRecurring,
                    recurrenceType: prev.isRecurring ? '' : 'weekly',
                    recurrenceEndDate: prev.isRecurring ? '' : prev.end_time.substring(0, 10)
                  }))}
                >
                  <input
                    type="checkbox"
                    checked={!!deskBookingData.isRecurring}
                    onChange={() => { }} // handled by click
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-gray-800">Repetir esta reserva</span>
                    <span className="text-xs text-gray-500">Criar uma série de reservas recorrentes</span>
                  </div>
                </div>

                {deskBookingData.isRecurring && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 animate-fade-in text-left">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Repetição</label>
                      <select
                        value={deskBookingData.recurrenceType}
                        onChange={(e) => setDeskBookingData(prev => ({ ...prev, recurrenceType: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white font-medium text-gray-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="weekly">Semanalmente</option>
                        <option value="daily">Diariamente</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Até à data</label>
                      <input
                        type="date"
                        value={deskBookingData.recurrenceEndDate}
                        onChange={(e) => setDeskBookingData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium text-gray-800"
                        onClick={(e) => e.stopPropagation()}
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setIsDeskBookingModalOpen(false); setDeskBookingData(null); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-primary-light text-sm"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          );
        })()}
      </Modal>
      <Footer /> {/* Rodapé no final da página */}
    </div>
  );
}

export default Dashboard;