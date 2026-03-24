import React, { createContext, useState } from 'react';
import axios from 'axios';

// Diz ao Axios para aceitar e enviar cookies de segurança do Backend
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Tenta ir buscar o token ao localStorage quando a app arranca
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const login = async (email, password) => {
    // Faz o pedido ao backend
    const response = await axios.post('https://projetofinalreservaoffice-backend.onrender.com/api/auth/login', { email, password });
    
    // Se tiver sucesso, guarda o token no estado e no LocalStorage (para não perder o login ao fazer F5)
    const newToken = response.data.accessToken;
    setToken(newToken);
    localStorage.setItem('token', newToken);
    return true;
  };

  const logout = async () => {
    // avisar o backend para destruir o cookie
    try {
      await axios.post('https://projetofinalreservaoffice-backend.onrender.com/api/auth/logout');
    } catch (err) {
      console.log("Erro ao fazer logout no servidor", err);
    }
    
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}