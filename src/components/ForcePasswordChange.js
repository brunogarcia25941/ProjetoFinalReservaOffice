import React, { useState, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

function ForcePasswordChange() {
  const { setUser, logout } = useContext(AuthContext);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As passwords não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-temp-password', { newPassword });
      toast.success("Password redefinida com sucesso!");
      // Atualizar localmente no contexto para desbloquear
      setUser(prev => ({ ...prev, must_change_password: 0 }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao atualizar a password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md text-center">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Alterar Password Obrigatória</h2>
          <p className="text-gray-500 text-sm mt-2">
            A tua conta foi criada com uma password provisória. Por razões de segurança, tens de escolher uma nova password forte para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Nova Password</label>
            <input
              type="password"
              placeholder="Mínimo 8 caracteres, maiúscula e número"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Confirmar Nova Password</label>
            <input
              type="password"
              placeholder="Confirme a nova password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'A guardar...' : 'Guardar e Entrar'}
          </button>
        </form>

        <button
          onClick={logout}
          className="mt-4 text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
        >
          Cancelar / Sair
        </button>
      </div>
    </div>
  );
}

export default ForcePasswordChange;
