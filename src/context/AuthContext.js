import React, { createContext, useState } from 'react';
import api from '../api/axiosConfig';
import { useQuery } from '@tanstack/react-query';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Função auxiliar para decodificar o payload do JWT sem depender do backend
  const decodeToken = (token) => {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      return JSON.parse(decodedJson);
    } catch (e) {
      return null;
    }
  };

  // Estado do token e do utilizador (carrega e decodifica do localStorage ao iniciar)
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('token');
    return savedToken ? decodeToken(savedToken) : null;
  });

  // REACT QUERY: Vai buscar os dados à BD
  useQuery({
    queryKey: ['userData', token], // Re-executa se o token mudar
    queryFn: async () => {
      const response = await api.get('/auth/me');
      setUser(prev => ({ ...prev, ...response.data }));
      return response.data;
    },
    enabled: !!token, // Só executa se houver um token
    staleTime: Infinity, // Evita pedidos constantes
    retry: false
  });

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { accessToken, refreshToken } = response.data;
      const userData = decodeToken(accessToken); 
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      setToken(accessToken);
      setUser(userData); 
      
      return true;
    } catch (error) {
      console.error("Erro no login:", error.response?.data?.message || error.message);
      throw error;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (err) {
      console.log("Erro no logout do servidor", err);
    }
    
    // Limpar dados locais
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null); 
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};