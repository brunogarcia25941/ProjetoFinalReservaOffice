import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Diz ao Axios para aceitar e enviar cookies de segurança do Backend
axios.defaults.withCredentials = true;

// 1. Criamos o contexto. Isto vai atuar como um "estado global" para os dados do utilizador.
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Tenta ir buscar o token ao localStorage quando a app arranca
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Adicionar estado para guardar os dados do utilizador
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    // Faz o pedido ao backend
    const response = await axios.post('https://projetofinalreservaoffice-backend.onrender.com/api/auth/login', { email, password });
    
    // Se tiver sucesso, guarda o token no estado e no LocalStorage (para não perder o login ao fazer F5)
    const newToken = response.data.accessToken;
    const userData = response.data.user; // backend devolve o utilizador 
    setToken(newToken);
    setUser(userData); // guarda os dados do utilizador no estado
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData)); // guarda os dados do utilizador no localStorage
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
    setUser(null); // limpa os dados do utilizador do estado
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // remove os dados do utilizador do localStorage
  };

    // Fornecemos os dados e as funções a qualquer componente "filho" que esteja dentro do Provider
    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};