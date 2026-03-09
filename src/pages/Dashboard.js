import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const [recursos, setRecursos] = useState([]);
  const [erro, setErro] = useState(null);
  
  const { logout, token } = useContext(AuthContext); // Trazer o token e o logout
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    // Vai buscar os dados ao backend
    axios.get('http://localhost:5000/api/resources', {
      headers: { Authorization: `Bearer ${token}` } // Injecta o Token de segurança
    })
      .then((response) => setRecursos(response.data))
      .catch((error) => {
        console.error("Erro na API:", error);
        setErro("Não foi possível carregar os recursos.");
      });
  }, []);

  const reservarRecurso = async (id, nome) => {
      if (!window.confirm(`Queres mesmo reservar o recurso: ${nome}?`)) return;

      try {
        // Criar as datas no formato que o backend espera (YYYY-MM-DD HH:MM:SS)
        const hoje = new Date().toISOString().split('T')[0];
        const startTime = `${hoje} 09:00:00`;
        const endTime = `${hoje} 18:00:00`;

        // Enviar os dados
        await axios.post('http://localhost:5000/api/bookings', {
          resource_id: id,
          start_time: startTime,
          end_time: endTime
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert('Reserva efetuada com sucesso!');
        window.location.reload(); 

      } catch (error) {
        console.error("Erro ao reservar:", error);
        alert(error.response?.data?.message || "Erro ao tentar reservar a mesa.");
      }
    };

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
          <a href="#/" className="text-blue-600 border-b-2 border-blue-600 pb-1">Reservar uma secretária</a>
          <a href="#/" className="hover:text-blue-600 transition-colors">Minhas Reservas</a>
          <div className="w-px h-5 bg-gray-300 mx-2"></div>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
              BA
            </div>
            <span>Bernardo Alves</span>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800 ml-4 font-medium">
            Sair
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar de Filtros (Esquerda) */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Localização</h3>
            <select className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500">
              <option>Piso 3 - Ala sul</option>
              <option>Piso 3 - Ala norte</option>
            </select>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tipo de mesa</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> Secretária Normal</label>
              <label className="flex items-center gap-2"><input type="checkbox" className="rounded text-blue-600" /> Secretária Alta</label>
              <label className="flex items-center gap-2"><input type="checkbox" className="rounded text-blue-600" /> Monitor Duplo</label>
            </div>
          </div>
        </aside>

        {/* Área Principal (Grelha de Mesas) */}
        <main className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Seleciona uma mesa para reservar</h2>
              <p className="text-sm text-gray-500">A mostrar todos os recursos disponíveis</p>
            </div>
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-100 border border-green-400"></span> Disponível</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-100 border border-red-400"></span> Em Manutenção</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-100 border border-blue-400"></span> Selecionado</span>
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm text-center">
              {erro}
            </div>
          )}

          {/* Grelha Dinâmica com os dados da Base de Dados */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recursos.map((recurso) => {
              const isAvailable = recurso.status === 'active';
              return (
                <div 
                  key={recurso.id} 
                  onClick={() => isAvailable ? reservarRecurso(recurso.id, recurso.name) : alert('Este recurso não está disponível de momento.')}
                  className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center
                    ${isAvailable 
                      ? 'bg-green-50/50 border-green-200 hover:border-green-400 hover:shadow-md cursor-pointer' 
                      : 'bg-red-50/50 border-red-200 opacity-70 cursor-not-allowed'
                    }`}
                >
                  {/* Ícone consoante o tipo */}
                  {recurso.type === 'monitor' ? (
                    <svg className={`w-8 h-8 mb-2 ${isAvailable ? 'text-green-600' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  ) : (
                    <svg className={`w-8 h-8 mb-2 ${isAvailable ? 'text-green-600' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 10h2v5a2 2 0 01-2 2H10a2 2 0 01-2-2v-5h2zm-4 0h4v5h-4v-5zm-6 0h2v5a2 2 0 002 2h0v-5H4v5a2 2 0 01-2-2v-5h2z"></path></svg>
                  )}
                  
                  <span className="font-bold text-gray-800">{recurso.name}</span>
                  <span className="text-xs text-gray-500 capitalize mt-1">{recurso.type}</span>
                  
                  {/* Badge de Estado */}
                  <span className={`mt-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full
                    ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isAvailable ? 'Available' : 'Maintenance'}
                  </span>
                </div>
              );
            })}
          </div>

        </main>
      </div>
    </div>
  );
}

export default Dashboard;