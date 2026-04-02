import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Diz ao Axios para aceitar e enviar cookies de segurança do Backend
axios.defaults.withCredentials = true;

// --- CONFIGURAÇÃO CENTRALIZADA DO URL ---
// Substituímos o Render pelo teu novo domínio da Vercel
const BASE_URL = 'https://projeto-final-reserva-office-backen.vercel.app/api/auth';

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

  // Função de Login
  const login = async (email, password) => {
    try {
      // Faz o pedido ao NOVO backend na Vercel usando a constante BASE_URL
      const response = await axios.post(`${BASE_URL}/login`, { email, password });
      
      // Se tiver sucesso, extrai os dados
      const newToken = response.data.accessToken;
      const userData = response.data.user; 
      
      // Atualiza o estado global
      setToken(newToken);
      setUser(userData); 
      
      // Guarda no LocalStorage para persistir o login se a página for atualizada
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData)); 
      
      return true;
    } catch (error) {
      console.error("Erro ao fazer login:", error.response?.data?.message || error.message);
      throw error; // Lança o erro para o componente Login.js o poder mostrar
    }
  };

  // Função de Logout
  const logout = async () => {
    try {
      // Avisa o servidor para limpar a sessão/cookies
      await axios.post(`${BASE_URL}/logout`);
    } catch (err) {
      console.log("Erro ao fazer logout no servidor (limpeza local efetuada)", err);
    }
    
    // Limpa tudo localmente, independentemente de o servidor responder ou não
    setToken(null);
    setUser(null); 
    localStorage.removeItem('token');
    localStorage.removeItem('user'); 
  };

  // Fornecemos os dados e as funções a qualquer componente "filho" (App.js, Dashboard, etc.)
  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};