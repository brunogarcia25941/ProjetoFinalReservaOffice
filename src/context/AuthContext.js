import React, { createContext, useState} from 'react';
import axios from 'axios';
import API_URL from '../config';

axios.defaults.withCredentials = true;

const BASE_URL = `${API_URL}/auth`;

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

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, { email, password });
      
      const newToken = response.data.accessToken;
      const userData = decodeToken(newToken); 
      
      setToken(newToken);
      setUser(userData); 
      
      localStorage.setItem('token', newToken);
      
      return true;
    } catch (error) {
      console.error("Erro no login:", error.response?.data?.message || error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${BASE_URL}/logout`);
    } catch (err) {
      console.log("Erro no logout do servidor", err);
    }
    
    // Limpar dados locais
    setToken(null);
    setUser(null); 
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};