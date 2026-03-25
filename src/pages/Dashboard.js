import React, { useEffect, useState, useContext } from 'react';
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
  useEffect(() => {
    // Vai buscar os dados ao backend
    axios.get('https://projetofinalreservaoffice-backend.onrender.com/api/resources', {
      headers: { Authorization: `Bearer ${token}` } // Injecta o Token de segurança
    })
      .then((response) => setRecursos(response.data)) // Guarda os dados no estado
      .catch((error) => {
        console.error("Erro na API:", error);
        setErro("Não foi possível carregar as mesas disponíveis.");
      });
  }, [token]);

  // --- FUNÇÃO DE RESERVA ---
  const reservarRecurso = async (id, nome) => {
      // Pede confirmação ao utilizador antes de avançar
      if (!window.confirm(`Queres mesmo reservar o recurso: ${nome}?`)) return;

      try {
        // Criar as datas no formato exigido pelo MySQL (YYYY-MM-DD HH:MM:SS)
        const hoje = new Date().toISOString().split('T')[0];
        const startTime = `${hoje} 09:00:00`;
        const endTime = `${hoje} 18:00:00`;

        // Enviar os dados
        await axios.post('https://projetofinalreservaoffice-backend.onrender.com/api/bookings', {
          resource_id: id,
          start_time: startTime,
          end_time: endTime
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
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Filtros</h3>
            
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-600 mb-2 block">LOCALIZAÇÃO (PISO)</label>
              <select 
                value={pisoFiltro}
                onChange={(e) => setPisoFiltro(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 cursor-pointer"
              >
                <option value="">Todos os Pisos</option>
                {pisosDisponiveis.map((piso) => (
                  <option key={piso} value={piso}>Piso {piso}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">TIPO DE RECURSO</label>
              <div className="space-y-2 text-sm text-gray-700">
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> Mesas</label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> Salas de Reunião</label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> Monitores</label>
              </div>
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
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-100 border border-green-400"></span> Disponível</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-100 border border-red-400"></span> Em Manutenção</span>
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm text-center font-medium">
              {erro}
            </div>
          )}

          {recursosFiltrados.length === 0 && !erro ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              Não existem recursos disponíveis para o filtro selecionado.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {recursosFiltrados.map((recurso) => {
                const isAvailable = recurso.status === 'active';
                return (
                  <div 
                    key={recurso.id} 
                    onClick={() => isAvailable ? reservarRecurso(recurso.id, recurso.name) : alert('Este recurso não está disponível de momento.')}
                    className={`relative p-5 rounded-xl border-2 transition-all flex flex-col items-center text-center
                      ${isAvailable 
                        ? 'bg-green-50/30 border-green-200 hover:border-green-400 hover:shadow-md cursor-pointer hover:-translate-y-1' 
                        : 'bg-red-50/50 border-red-200 opacity-60 cursor-not-allowed'
                      }`}
                  >
                    {recurso.type === 'monitor' ? (
                      <svg className={`w-8 h-8 mb-3 ${isAvailable ? 'text-green-600' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    ) : (
                      <svg className={`w-8 h-8 mb-3 ${isAvailable ? 'text-green-600' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 10h2v5a2 2 0 01-2 2H10a2 2 0 01-2-2v-5h2zm-4 0h4v5h-4v-5zm-6 0h2v5a2 2 0 002 2h0v-5H4v5a2 2 0 01-2-2v-5h2z"></path></svg>
                    )}
                    
                    <span className="font-bold text-gray-800 text-base">{recurso.name}</span>
                    <span className="text-xs text-gray-500 capitalize mt-1 flex items-center gap-1">
                      {recurso.type} • Piso {recurso.floor || '?'}
                    </span>
                    
                    <span className={`mt-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full
                      ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isAvailable ? 'Disponível' : 'Manutenção'}
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