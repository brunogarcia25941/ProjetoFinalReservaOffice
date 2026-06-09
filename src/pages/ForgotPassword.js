import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const response = await api.post(`/auth/forgot-password`, { email });
      toast.success(response.data.message || 'Email de recuperação enviado!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao pedir a recuperação.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Recuperar Password</h2>
          <p className="text-gray-500 text-center text-sm mt-1">Insere o teu email e enviaremos um link para redefinir a tua password</p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço de Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" 
              placeholder="Ex: colaborador@softinsa.pt" 
            />
          </div>

          <button 
            type="submit" 
            disabled={carregando}
            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${carregando ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {carregando ? 'A enviar...' : 'Enviar Link de Recuperação'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Voltar ao Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;