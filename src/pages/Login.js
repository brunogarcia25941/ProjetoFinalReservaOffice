import { useNavigate } from 'react-router-dom';
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoginForm from '../components/forms/LoginForm';
import Modal from '../components/ui/Modal';
import api from '../api/axiosConfig';

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [loading, setLoading] = useState(false);

  const fazerLogin = async (email, password) => {
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      const mensagemErro = error.response?.data?.message || 'Email ou palavra-passe incorretos.';
      toast.error(mensagemErro);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!reqName || !reqEmail) {
      toast.error("Nome e Email são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register-request', {
        name: reqName,
        email: reqEmail,
        reason: reqReason
      });
      toast.success(response.data.message);
      setIsRequestModalOpen(false);
      setReqName('');
      setReqEmail('');
      setReqReason('');
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao enviar pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className=" p-3 rounded-xl mb-4">
            <img
              src="/logo.png"
              alt="Logo Reserva Office"
              className="w-28 h-28 object-contain mb-4 rounded-xl"
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Bem vindo à Reserva Office</h2>
          <p className="text-gray-500 text-sm mt-1">Faz Login para reservar a tua área de trabalho</p>
        </div>

        <LoginForm onSubmit={fazerLogin} />

        <div className="mt-6 text-center text-sm text-gray-600">
          Não tens uma conta?{' '}
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="font-medium text-primary hover:text-primary-hover focus:outline-none cursor-pointer"
          >
            Contacta o teu administrador
          </button>
        </div>
      </div>

      <div className="mt-8 text-xs text-gray-400">
        &copy; 2026 Reserva Office. Todos os direitos reservados.
      </div>

      {/* Modal para contactar o admin / pedido de registo */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Pedir Registo de Conta"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRequestSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nome Completo</label>
            <input
              type="text"
              value={reqName}
              onChange={(e) => setReqName(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary"
              placeholder="Ex: João Silva"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={reqEmail}
              onChange={(e) => setReqEmail(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary"
              placeholder="Ex: joao.silva@empresa.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Motivo / Justificação (Opcional)</label>
            <textarea
              value={reqReason}
              onChange={(e) => setReqReason(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary h-24 resize-none"
              placeholder="Ex: Necessito de reservar mesa no Piso 2 para o projeto XYZ."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'A enviar...' : 'Enviar Pedido'}
            </button>
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 font-bold py-2.5 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Login;