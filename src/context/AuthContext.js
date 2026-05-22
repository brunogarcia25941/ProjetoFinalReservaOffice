import React, { createContext, useState} from 'react';
import axios from 'axios';
import API_URL from '../config';

axios.defaults.withCredentials = true;

const BASE_URL = `${API_URL}/auth`;

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Estado do token e do utilizador (carrega do localStorage ao iniciar)
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, { email, password });
      
      const newToken = response.data.accessToken;
      const userData = response.data.user; 
      
      setToken(newToken);
      setUser(userData); 
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData)); 
      
      return true;
    } catch (error) {
      const detailedError = error.response?.data?.error || error.response?.data?.message || error.message;
      console.error("Erro no login:", detailedError);
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
    localStorage.removeItem('user'); 
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};