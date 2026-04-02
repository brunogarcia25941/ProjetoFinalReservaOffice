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

  const [isLoading, setIsLoading] = useState(true);

  // Estado para guardar as datas da reserva (com valores padrão para o dia atual)
  const hoje = new Date().toISOString().split('T')[0];
  const [dataInicio, setDataInicio] = useState(`${hoje}T09:00`);
  const [dataFim, setDataFim] = useState(`${hoje}T18:00`);

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

      // Mostrar a confirmação com as horas exatas para o utilizador confirmar
      const mensagemConfirmacao = `Queres mesmo reservar o recurso: ${nome}?\n\nInício: ${new Date(startTimeFormatado).toLocaleString('pt-PT')}\nFim: ${new Date(endTimeFormatado).toLocaleString('pt-PT')}`;
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

  // Criar uma nova lista apenas com os recursos que passam no filtro
  const recursosFiltrados = recursos.filter((recurso) => {
    if (pisoFiltro === '') return true; // Se o filtro estiver vazio, mostra tudo
    return String(recurso.floor) === String(pisoFiltro);
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
          <span className="text-blue-600 border-b-2 border-blue-600 pb-1">Reservar Mesa</span>
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
          <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800 ml-4 font-medium">
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
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full mt-1 border border-gray-300 rounded p-1.5 text-xs focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Fim</label>
                  <input 
                    type="datetime-local" 
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full mt-1 border border-gray-300 rounded p-1.5 text-xs focus:ring-blue-500 focus:border-blue-500"
                  />
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
            {/* Legenda dos estados */}
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-100 border border-green-400"></span> Disponível</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-100 border border-gray-400"></span> Ocupado</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-100 border border-red-400"></span> Manutenção</span>
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

          {/* Loading state enquanto a API responde */}
          {isLoading && new Date(dataInicio) < new Date(dataFim) && (
              <div className="text-center py-12 text-gray-500 font-medium animate-pulse">
                A verificar disponibilidade na base de dados...
              </div>
          )}

          {/* Se não houver mesas após o filtro */}
          {!isLoading && recursosFiltrados.length === 0 && !erro && new Date(dataInicio) < new Date(dataFim) && (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              Não existem recursos disponíveis para os filtros selecionados.
            </div>
          )}

          {/* A Grelha de Mesas */}
          {!isLoading && new Date(dataInicio) < new Date(dataFim) && recursosFiltrados.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {recursosFiltrados.map((recurso) => {
                const isMaintenance = recurso.status === 'maintenance';
                const isAlreadyBooked = recurso.is_booked === 1; // Vem do Backend!
                
                // Uma mesa só está clicável/disponível se estiver ativa E NÃO estiver ocupada
                const isAvailable = !isMaintenance && !isAlreadyBooked;

                return (
                  <div 
                    key={recurso.id} 
                    onClick={() => {
                        if (isMaintenance) alert('Este recurso está em manutenção.');
                        else if (isAlreadyBooked) alert('Lamentamos, mas esta mesa já está reservada para o horário que escolheste.');
                        else reservarRecurso(recurso.id, recurso.name);
                    }}
                    className={`relative p-5 rounded-xl border-2 transition-all flex flex-col items-center text-center h-full
                      ${isAvailable 
                        ? 'bg-green-50/30 border-green-200 hover:border-green-400 hover:shadow-md cursor-pointer hover:-translate-y-1' 
                        : isAlreadyBooked
                        ? 'bg-gray-50/50 border-gray-200 opacity-60 cursor-not-allowed' // Greyed out (Ocupado)
                        : 'bg-red-50/50 border-red-200 opacity-60 cursor-not-allowed'   // Red out (Manutenção)
                      }`}
                  >
                    
                    {/* SVGs originais restaurados e com cores lógicas! */}
                    {recurso.type === 'monitor' ? (
                      <svg className={`w-8 h-8 mb-3 ${isAvailable ? 'text-green-600' : isAlreadyBooked ? 'text-gray-400' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    ) : (
                      <svg className={`w-8 h-8 mb-3 ${isAvailable ? 'text-green-600' : isAlreadyBooked ? 'text-gray-400' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 10h2v5a2 2 0 01-2 2H10a2 2 0 01-2-2v-5h2zm-4 0h4v5h-4v-5zm-6 0h2v5a2 2 0 002 2h0v-5H4v5a2 2 0 01-2-2v-5h2z"></path></svg>
                    )}
                    
                    <span className={`font-bold text-base ${isAvailable ? 'text-gray-800' : 'text-gray-500'}`}>{recurso.name}</span>
                    <span className="text-xs text-gray-400 capitalize mt-1 flex items-center gap-1">
                      {recurso.type} • Piso {recurso.floor || '?'}
                    </span>

                    {/* Tag visual do estado atual da mesa */}
                    <span className={`mt-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full
                      ${isAvailable ? 'bg-green-100 text-green-700' : isAlreadyBooked ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
                      {isAvailable ? 'Disponível' : isAlreadyBooked ? 'Ocupada' : 'Manutenção'}
                    </span>
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