import axios from 'axios';
import API_URL from '../config';

// Criar a instância central do Axios
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o Token automaticamente em cada pedido
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com a expiração do Token (Refresh Token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 (Não autorizado) e ainda não tentámos renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Chamada direta para o refresh usando o axios base para evitar loops
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken } = response.data;

          localStorage.setItem('token', accessToken);
          
          // Atualizar o header do pedido original e repetir
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Se o refresh falhar, forçamos o logout limpando o storage
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          // Redirecionar para login se necessário ou emitir evento
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
