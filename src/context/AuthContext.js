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

  // Interceptor para lidar com a expiração do Access Token
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Se o erro for 401 (Não autorizado) e ainda não tentámos renovar
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
          try {
            const response = await axios.post(`${BASE_URL}/refresh`, { refreshToken });
            const { accessToken } = response.data;
            
            localStorage.setItem('token', accessToken);
            setToken(accessToken);
            
            // Atualizar o header do pedido original e repetir
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Se o refresh falhar, forçamos o logout
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setToken(null);
            setUser(null);
          }
        }
      }
      return Promise.reject(error);
    }
  );

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, { email, password });
      
      const { accessToken, refreshToken } = response.data;
      const userData = decodeToken(accessToken); 
      
      setToken(accessToken);
      setUser(userData); 
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      return true;
    } catch (error) {
      console.error("Erro no login:", error.response?.data?.message || error.message);
      throw error;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await axios.post(`${BASE_URL}/logout`, { refreshToken }, {
          headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.log("Erro no logout do servidor", err);
    }
    
    // Limpar dados locais
    setToken(null);
    setUser(null); 
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};