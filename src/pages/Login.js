import { useNavigate } from 'react-router-dom';
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Login() {
  // useNavigate: Permite redirecionar o utilizador para outras páginas via código
  const navigate = useNavigate();
  
  // Extraímos a função 'login' do nosso contexto global de autenticação
  const { login } = useContext(AuthContext);
  
  // --- ESTADOS DO COMPONENTE ---
  // Guardam o que o utilizador escreve nos inputs em tempo real
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');

  // --- FUNÇÃO DE SUBMISSÃO ---
  const fazerLogin = async (e) => {
    e.preventDefault(); // Impede que a página faça "refresh" ao submeter o formulário
    setErro(''); // Limpa erros de tentativas anteriores

    try {
      // Chama a função do Context (que por sua vez comunica com o Backend)
      await login(email, password); 
      // Se a promessa for resolvida com sucesso, reencaminha para o painel principal
      navigate('/dashboard');       
    } catch (error) {
      // Se falhar (ex: credenciais erradas), mostra a mensagem de erro na interface
      setErro('Email ou palavra-passe incorretos.'); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans">
      
      {/* Cartão Centralizado */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md">
        
        {/* Ícone e Cabeçalho */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Bem vindo à Reserva Office</h2>
          <p className="text-gray-500 text-sm mt-1">Faz Login para reservar a tua área de trabalho</p>
        </div>

        {/* Formulário */}
        <form onSubmit={fazerLogin} className="space-y-5">
          {erro && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{erro}</div>}
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço de Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Ex: colaborador@softinsa.pt" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="••••••••" />
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Lembrar-me</label>
            </div>
            <div className="text-sm">
              <a href="#/" className="font-medium text-blue-600 hover:text-blue-500">Esqueceu a palavra-passe?</a>
            </div>
          </div>

          {/* Botão Sign In */}
          <button type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Sign In
          </button>
        </form>

        {/* Contact Admin */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <a href="#/" className="font-medium text-blue-600 hover:text-blue-500">Contact your admin</a>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-xs text-gray-400">
        &copy; 2026 Reserva Office. All rights reserved.
      </div>
    </div>
  );
}

export default Login;