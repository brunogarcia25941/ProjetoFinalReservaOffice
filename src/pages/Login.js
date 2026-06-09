import { useNavigate } from 'react-router-dom';
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoginForm from '../components/forms/LoginForm';

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const fazerLogin = async (email, password) => {
    try {
      await login(email, password); 
      navigate('/dashboard');       
    } catch (error) {
      const mensagemErro = error.response?.data?.message || 'Email ou palavra-passe incorretos.';
      toast.error(mensagemErro);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary p-3 rounded-xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Bem vindo à Reserva Office</h2>
          <p className="text-gray-500 text-sm mt-1">Faz Login para reservar a tua área de trabalho</p>
        </div>

        <LoginForm onSubmit={fazerLogin} />

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <a href="#/" className="font-medium text-primary hover:text-primary-hover">Contact your admin</a>
        </div>
      </div>

      <div className="mt-8 text-xs text-gray-400">
        &copy; 2026 Reserva Office. All rights reserved.
      </div>
    </div>
  );
}

export default Login;