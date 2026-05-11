import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  // --- ESTADOS ---
  // 'recursos' guarda a lista de mesas/salas vindas da Base de Dados
  const [recursos, setRecursos] = useState([]);
  const [erro, setErro] = useState(null);

  // Estado para guardar o piso selecionado no filtro
  const [pisoFiltro, setPisoFiltro] = useState('');

  const [statusFiltro, setStatusFiltro] = useState('todos'); // Pode ser: 'todos', 'disponivel', 'ocupado', 'manutencao'

  const [tiposDesmarcados, setTiposDesmarcados] = useState([]); // Guarda os tipos que o utilizador tirou o visto

  const [isLoading, setIsLoading] = useState(true);

  // Estado para guardar as datas da reserva (com valores padrão para o dia atual)
  const hoje = new Date().toISOString().split('T')[0];
  const [dataInicio, setDataInicio] = useState(`${hoje}T09:00`);
  const [dataFim, setDataFim] = useState(`${hoje}T18:00`);

  // Estado para saber qual o atalho selecionado e o número de horas personalizado num atalho
  const [atalhoAtivo, setAtalhoAtivo] = useState(null);
  const [numHoras, setNumHoras] = useState(2);

  // Extraímos o token de segurança e a função de logout do contexto global
  const { logout, token, user } = useContext(AuthContext); 
  const navigate = useNavigate();

  // Função para ir buscar as iniciais (Ex: "Bernardo Alves" -> "BA")
  const getIniciais = (nome) => {
    if (!nome) return 'U';
    const partes = nome.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return partes[0][0].toUpperCase();
  };

  // Função para terminar a sessão e voltar ao ecrã inicial
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // --- BUSCAR DADOS AO ARRANCAR (useEffect) ---
  // Executa automaticamente quando a página Dashboard é carregada
  // 1. Helper para formatar a data (YYYY-MM-DD HH:mm:00)
  const formatMySQLDate = (htmlDate) => htmlDate.replace('T', ' ') + ':00';
  
  // Helper para converter data de JS para o formato do Input HTML (YYYY-MM-DDTHH:mm)
  const getLocalISOString = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date - offset)).toISOString().slice(0, 16);
  };

  // Função que aplica as Tags/Atalhos de tempo
  const aplicarAtalho = (tipo) => {
    let inicio = new Date();
    let fim = new Date();
    setAtalhoAtivo(tipo);

    if (tipo === 'resto_hoje') {
        if (inicio.getHours() < 9) inicio.setHours(9, 0, 0); // Se for antes das 9, puxa para as 9
        fim.setHours(18, 0, 0);
    } else if (tipo === 'proximas_h') {
        if (inicio.getHours() < 9) inicio.setHours(9, 0, 0);
        fim = new Date(inicio.getTime() + numHoras * 60 * 60 * 1000);
        if (fim.getHours() >= 18) fim.setHours(18, 0, 0); // Tranca às 18h
    } else if (tipo === 'amanha') {
        inicio.setDate(inicio.getDate() + 1); // Dia seguinte
        inicio.setHours(9, 0, 0);
        fim = new Date(inicio);
        fim.setHours(18, 0, 0);
    } else if (tipo === 'semana') {
        inicio.setHours(9, 0, 0);
        const diasParaSexta = 5 - fim.getDay(); // Calcula distância até Sexta-feira
        fim.setDate(fim.getDate() + (diasParaSexta >= 0 ? diasParaSexta : 6));
        fim.setHours(18, 0, 0);
    }
    
    setDataInicio(getLocalISOString(inicio));
    setDataFim(getLocalISOString(fim));
  };

  // Validação: Verifica se as horas escolhidas estão fora do horário (9h-18h)
  const horaInicio = new Date(dataInicio).getHours();
  const horaFim = new Date(dataFim).getHours();
  const minFim = new Date(dataFim).getMinutes();
  const isForaDeHoras = horaInicio < 9 || horaFim > 18 || (horaFim === 18 && minFim > 0);

  // 2. função que chama a rota inteligente
  const carregarRecursosComDisponibilidade = useCallback(async () => {
    if (!token || !dataInicio || !dataFim) return;

    setIsLoading(true);
    setErro(null);

    const startTimeFormatado = formatMySQLDate(dataInicio);
    const endTimeFormatado = formatMySQLDate(dataFim);

    if (new Date(startTimeFormatado) >= new Date(endTimeFormatado)) {
        setRecursos([]); 
        return; 
    }

    if (isForaDeHoras) {
        setRecursos([]);
        return;
    }

    try {
      const response = await axios.get('https://projeto-final-reserva-office-backen.vercel.app/api/resources/availability', {
        headers: { Authorization: `Bearer ${token}` },
        params: { start: startTimeFormatado, end: endTimeFormatado }
      });
      setRecursos(response.data);
    } catch (error) {
      console.error("Erro na API:", error);
      setErro("Não foi possível carregar a disponibilidade dos recursos.");
    } finally {
      setIsLoading(false);
    }
  }, [token, dataInicio, dataFim]);

  // 3. useEffect que reage às mudanças de hora
  useEffect(() => {
    carregarRecursosComDisponibilidade();
  }, [carregarRecursosComDisponibilidade]);

  // --- FUNÇÃO DE RESERVA ---
  const reservarRecurso = async (id, nome) => {
    // Validar se os campos estão preenchidos
      if (!dataInicio || !dataFim) {
        alert("Por favor, seleciona a data e hora de início e de fim no menu lateral.");
        return;
      }
      

      // Converter do formato do HTML (YYYY-MM-DDTHH:mm) para o MySQL (YYYY-MM-DD HH:mm:00)
      const startTimeFormatado = formatMySQLDate(dataInicio);
      const endTimeFormatado = formatMySQLDate(dataFim);;

      // Validação  para evitar que o fim seja antes do início
      if (new Date(startTimeFormatado) >= new Date(endTimeFormatado)) {
        alert("Atenção: A data/hora de fim tem de ser depois da data/hora de início!");
        return;
      }

      if (isForaDeHoras) {
        setRecursos([]);
        return;
    }

      // Mostrar a confirmação com as horas exatas para o utilizador confirmar
      const mensagemConfirmacao = `Queres mesmo reservar o recurso: ${nome}?\n\nInício: ${new Date(startTimeFormatado.replace(' ', 'T')).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })}\nFim: ${new Date(endTimeFormatado.replace(' ', 'T')).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })}`;
      if (!window.confirm(mensagemConfirmacao)) return;

      try {

        // Enviar os dados
        await axios.post('https://projeto-final-reserva-office-backen.vercel.app/api/bookings', {
          resource_id: id,
          start_time: startTimeFormatado,
          end_time: endTimeFormatado
        }, {
          headers: { Authorization: `Bearer ${token}` } // Token obrigatório para criar dados
        });

        alert('Reserva efetuada com sucesso!');
        window.location.reload(); // Recarrega a página para atualizar o estado da mesa

      } catch (error) {
        console.error("Erro ao reservar:", error);
        // Mostra a mensagem de erro que vem do backend (ex: "Recurso já reservado")
        alert(error.response?.data?.message || "Erro ao tentar reservar a mesa.");
      }
    };

  // Descobrir automaticamente todos os pisos únicos que vêm da Base de Dados
  const pisosDisponiveis = [...new Set(recursos.map(r => r.floor))].filter(Boolean).sort();

  // Descobrir os tipos únicos de recursos na BD
  const tiposDisponiveis = [...new Set(recursos.map(r => r.type))].filter(Boolean).sort();
  
  // Função para traduzir o nome inglês da BD para português no ecrã
  const traduzirTipo = (tipo) => {
    if (tipo === 'desk') return 'Mesas';
    if (tipo === 'room') return 'Salas de Reunião';
    if (tipo === 'monitor') return 'Monitores';
    return tipo;
  };

  // Criar uma nova lista apenas com os recursos que passam no filtro
  // Lógica de Filtragem Múltipla (Piso + Estado + Tipo)
  const recursosFiltrados = recursos.filter((recurso) => {
    // Verifica o Piso
    const passaPiso = pisoFiltro === '' || String(recurso.floor) === String(pisoFiltro);

    // Descobre o estado real desta mesa
    const isMaintenance = recurso.status === 'maintenance';
    const isAlreadyBooked = recurso.is_booked === 1;
    const isAvailable = !isMaintenance && !isAlreadyBooked;

    // Verifica o Filtro dos Botões
    let passaStatus = true;
    if (statusFiltro === 'disponivel') passaStatus = isAvailable;
    else if (statusFiltro === 'ocupado') passaStatus = isAlreadyBooked && !isMaintenance;
    else if (statusFiltro === 'manutencao') passaStatus = isMaintenance;

    // Verifica a Checklist de Tipos
    const passaTipo = !tiposDesmarcados.includes(recurso.type);

    // A mesa só aparece se passar nos três filtros
    return passaPiso && passaStatus && passaTipo;
  });


  

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar Superior */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-800">Reserva Office</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
          <span className="text-blue-600 border-b-2 border-blue-600 pb-1">Reservar Recurso</span>
          <Link to="/minhas-reservas" className="hover:text-blue-600 transition-colors">As Minhas Reservas</Link>
          <div className="w-px h-5 bg-gray-300 mx-2"></div>
          <div className="flex items-center gap-2 ">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
              {getIniciais(user?.name)}
            </div>
            <span className="font-medium">{user?.name || 'Utilizador'}</span>
            
            {/* Se for Admin, mostra a tag vermelha clicável */}
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

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar de Filtros (Esquerda) */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider border-b border-gray-100 pb-2">Configurar Reserva</h3>
            
            {/*Componente de Escolha de Data e Hora */}
            <div className="mb-5 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Horário</label>
              
              <div className="space-y-3 mt-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Início</label>
                  <input 
                    type="datetime-local" 
                    value={dataInicio}
                    onChange={(e) => {
                      setDataInicio(e.target.value);
                      setAtalhoAtivo(null); // Limpa a seleção do atalho
                    }}
                    className="w-full mt-1 border border-gray-300 rounded p-1.5 text-xs focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Fim</label>
                  <input 
                    type="datetime-local" 
                    value={dataFim}
                    onChange={(e) => {
                      setDataFim(e.target.value);
                      setAtalhoAtivo(null); // Limpa a seleção do atalho
                    }}
                    className="w-full mt-1 border border-gray-300 rounded p-1.5 text-xs focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-200/60">
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Atalhos Rápidos
                  </span>
                  {/* Tooltip simples a usar o title */}
                  <span title="Escolha um intervalo de tempo predefinido" className="cursor-help text-gray-400">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path></svg>
                  </span>
                </label>

                <div className="flex flex-wrap gap-1.5">
                  {/* Atalho Resto de Hoje */}
                  <button 
                    onClick={() => aplicarAtalho('resto_hoje')} 
                    className={`text-[10px] font-bold px-2 py-1.5 rounded-md transition-all border ${atalhoAtivo === 'resto_hoje' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}
                  >
                    Resto de Hoje
                  </button>

                  {/* Atalho Próximas X Horas (Com Input) */}
                  <div className={`flex items-center border rounded-md transition-all ${atalhoAtivo === 'proximas_h' ? 'border-blue-600 bg-blue-600' : 'border-blue-200 bg-white'}`}>
                    <input 
                      type="number" 
                      value={numHoras} 
                      min="1" 
                      max="9"
                      onChange={(e) => setNumHoras(parseInt(e.target.value) || 1)}
                      className={`w-8 text-center text-[10px] font-bold bg-transparent outline-none ${atalhoAtivo === 'proximas_h' ? 'text-white' : 'text-blue-700'}`}
                    />
                    <button 
                      onClick={() => aplicarAtalho('proximas_h')} 
                      className={`text-[10px] font-bold px-2 py-1.5 rounded-r-md transition-all ${atalhoAtivo === 'proximas_h' ? 'text-white hover:bg-blue-700' : 'text-blue-700 border-l border-blue-100 hover:bg-blue-50'}`}
                    >
                      Próximas Horas
                    </button>
                  </div>

                  <button 
                    onClick={() => aplicarAtalho('amanha')} 
                    className={`text-[10px] font-bold px-2 py-1.5 rounded-md transition-all border ${atalhoAtivo === 'amanha' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}
                  >
                    Amanhã
                  </button>

                  <button 
                    onClick={() => aplicarAtalho('semana')} 
                    className={`text-[10px] font-bold px-2 py-1.5 rounded-md transition-all border ${atalhoAtivo === 'semana' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}
                  >
                    Esta Semana
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-600 mb-2 block">LOCALIZAÇÃO (PISO)</label>
              <select 
                value={pisoFiltro}
                onChange={(e) => setPisoFiltro(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 cursor-pointer"
              >
                <option value="">Todos os Pisos</option>
                {pisosDisponiveis.map((piso) => (
                  <option key={piso} value={piso}>Piso {piso}</option>
                ))}
              </select>
            </div>

            {/* TIPO DE RECURSO */}
            {tiposDisponiveis.length > 0 && (
              <div className="mb-5 border-t border-gray-100 pt-5">
                <label className="text-xs font-semibold text-gray-600 mb-2 block">TIPO DE RECURSO</label>
                <div className="space-y-2 text-sm text-gray-700">
                  {tiposDisponiveis.map(tipo => (
                    <label key={tipo} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                      <input 
                        type="checkbox" 
                        checked={!tiposDesmarcados.includes(tipo)}
                        onChange={() => {
                          if (tiposDesmarcados.includes(tipo)) {
                            // Se estava desmarcado, volta a marcar (tira da lista)
                            setTiposDesmarcados(prev => prev.filter(t => t !== tipo));
                          } else {
                            // Se estava marcado, desmarca (adiciona à lista)
                            setTiposDesmarcados(prev => [...prev, tipo]);
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer border-gray-300" 
                      /> 
                      <span className="capitalize">{traduzirTipo(tipo)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </aside>

        {/* Área Principal (Grelha de Mesas) */}
        <main className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Seleciona um recurso para reservar</h2>
              <p className="text-sm text-gray-500">
                A mostrar {recursosFiltrados.length} recurso(s) {pisoFiltro ? `no Piso ${pisoFiltro}` : 'em todos os pisos'}.
              </p>
            </div>
            {/* Filtros de Estado (Botões Clicáveis) */}
            <div className="flex gap-2 text-xs font-medium">
              <button 
                onClick={() => setStatusFiltro(statusFiltro === 'disponivel' ? 'todos' : 'disponivel')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${statusFiltro === 'disponivel' ? 'bg-green-50 border-green-400 shadow-sm text-green-800' : 'bg-transparent border-transparent hover:bg-gray-50 text-gray-600'}`}
              >
                <span className="w-3 h-3 rounded-full bg-green-100 border border-green-400"></span> 
                Disponível
              </button>
              
              <button 
                onClick={() => setStatusFiltro(statusFiltro === 'ocupado' ? 'todos' : 'ocupado')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${statusFiltro === 'ocupado' ? 'bg-gray-100 border-gray-400 shadow-sm text-gray-800' : 'bg-transparent border-transparent hover:bg-gray-50 text-gray-600'}`}
              >
                <span className="w-3 h-3 rounded-full bg-gray-200 border border-gray-400"></span> 
                Ocupado
              </button>

              <button 
                onClick={() => setStatusFiltro(statusFiltro === 'manutencao' ? 'todos' : 'manutencao')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${statusFiltro === 'manutencao' ? 'bg-red-50 border-red-400 shadow-sm text-red-800' : 'bg-transparent border-transparent hover:bg-gray-50 text-gray-600'}`}
              >
                <span className="w-3 h-3 rounded-full bg-red-100 border border-red-400"></span> 
                Manutenção
              </button>
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm text-center font-medium">
              {erro}
            </div>
          )}
          
          {/* Validação visual de horário inválido */}
          {new Date(dataInicio) >= new Date(dataFim) && (
            <div className="bg-orange-50 text-orange-700 p-8 rounded-lg mb-6 text-center border border-dashed border-orange-300">
              <svg className="w-12 h-12 mx-auto mb-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <h4 className="font-bold text-lg">Horário de Reserva Inválido</h4>
              <p className="text-sm mt-1">Por favor, ajusta os filtros laterais: a hora de fim tem de ser posterior à hora de início.</p>
            </div>
          )}

          {isForaDeHoras && new Date(dataInicio) < new Date(dataFim) && (
            <div className="bg-orange-50 text-orange-700 p-8 rounded-xl mb-6 text-center border border-dashed border-orange-300 animate-fade-in">
              <svg className="w-12 h-12 mx-auto mb-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h4 className="font-bold text-lg">Fora do Horário De Escritório</h4>
              <p className="text-sm mt-1">O escritório funciona apenas entre as <b>09:00 e as 18:00</b>.<br/>Por favor, clica nos atalhos laterais ou ajusta o horário manualmente.</p>
            </div>
          )}

          {/* Loading state enquanto a API responde */}
          {isLoading && new Date(dataInicio) < new Date(dataFim) && (
              <div className="text-center py-12 text-gray-500 font-medium animate-pulse">
                A verificar disponibilidade na base de dados...
              </div>
          )}

          {/* Se não houver mesas após o filtro */}
          {!isLoading && recursosFiltrados.length === 0 && !erro && !isForaDeHoras && new Date(dataInicio) < new Date(dataFim) && (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              Não existem recursos disponíveis para os filtros selecionados.
            </div>
          )}

          {/* As Grelhas Agrupadas por Tipo */}
          {!isLoading && new Date(dataInicio) < new Date(dataFim) && !isForaDeHoras && recursosFiltrados.length > 0 && (
            <div className="space-y-10"> {/* Espaçamento entre as categorias */}
              
              {/* 1. Descobrimos quais os "tipos" que existem na nossa lista atual filtrada */}
              {[...new Set(recursosFiltrados.map(r => r.type))].map(tipo => {
                
                // 2. Filtramos apenas os recursos que pertencem a este tipo
                const recursosDesteTipo = recursosFiltrados.filter(r => r.type === tipo);
                
                return (
                  <div key={tipo} className="animate-fade-in">
                    {/* Título da Secção (Ex: "Salas de Reunião") com contador */}
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                      {tipo === 'monitor' ? (
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 10h2v5a2 2 0 01-2 2H10a2 2 0 01-2-2v-5h2zm-4 0h4v5h-4v-5zm-6 0h2v5a2 2 0 002 2h0v-5H4v5a2 2 0 01-2-2v-5h2z"></path></svg>
                      )}
                      {traduzirTipo(tipo)}
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full ml-1">
                        {recursosDesteTipo.length}
                      </span>
                    </h3>
                    
                    {/* Grelha apenas com os recursos deste tipo */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-6 gap-3">
                      {recursosDesteTipo.map((recurso) => {
                        const isMaintenance = recurso.status === 'maintenance';
                        const isAlreadyBooked = recurso.is_booked === 1;
                        const isAvailable = !isMaintenance && !isAlreadyBooked;

                        return (
                          <div 
                            key={recurso.id} 
                            onClick={() => {
                                if (isMaintenance) alert('Este recurso está em manutenção.');
                                else if (isAlreadyBooked) alert('Lamentamos, mas esta mesa já está reservada para o horário que escolheste.');
                                else reservarRecurso(recurso.id, recurso.name);
                            }}
                            className={`relative p-3 rounded-xl border transition-all flex flex-col items-center text-center h-full
                              ${isAvailable 
                                ? 'bg-green-50/30 border-green-200 hover:border-green-400 hover:shadow-sm cursor-pointer hover:-translate-y-1' 
                                : isAlreadyBooked
                                ? 'bg-gray-50/50 border-gray-200 opacity-60 cursor-not-allowed' 
                                : 'bg-red-50/50 border-red-200 opacity-60 cursor-not-allowed'   
                              }`}
                          >
                            
                            {recurso.type === 'monitor' ? (
                              <svg className={`w-6 h-6 mb-2 ${isAvailable ? 'text-green-600' : isAlreadyBooked ? 'text-gray-400' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            ) : (
                              <svg className={`w-6 h-6 mb-2 ${isAvailable ? 'text-green-600' : isAlreadyBooked ? 'text-gray-400' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 10h2v5a2 2 0 01-2 2H10a2 2 0 01-2-2v-5h2zm-4 0h4v5h-4v-5zm-6 0h2v5a2 2 0 002 2h0v-5H4v5a2 2 0 01-2-2v-5h2z"></path></svg>
                            )}
                            
                            <span 
                              className={`font-bold text-xs ${isAvailable ? 'text-gray-800' : 'text-gray-500'} leading-tight truncate w-full px-1`} 
                              title={recurso.name}
                            >
                              {recurso.name}
                            </span>
                            
                            <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                              Piso {recurso.floor || '?'}
                            </span>

                            <span className={`mt-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                              ${isAvailable ? 'bg-green-100 text-green-700' : isAlreadyBooked ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
                              {isAvailable ? 'Livre' : isAlreadyBooked ? 'Ocupada' : 'Avariada'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default Dashboard;