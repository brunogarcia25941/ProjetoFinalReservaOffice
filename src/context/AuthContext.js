import React, { createContext, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Tenta ir buscar o token ao localStorage quando a app arranca
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const login = async (email, password) => {
    // Faz o pedido ao backend
    const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    
    // Se tiver sucesso, guarda o token no estado e no LocalStorage (para não perder o login ao fazer F5)
    const newToken = response.data.token;
    setToken(newToken);
    localStorage.setItem('token', newToken);
    return true;
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}