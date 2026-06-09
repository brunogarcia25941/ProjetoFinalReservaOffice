import React, { useContext } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componente para proteger rotas que exigem login
const RotaPrivada = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

// Componente para proteger rotas exclusivas de Admin
const RotaAdmin = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  return (token && user?.role === 'admin') ? children : <Navigate to="/dashboard" />;
};

// --- CONFIGURAÇÃO DE ROTAS EM ARRAYS ---

const rotasPublicas = [
  { path: '/login', element: <Login /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
];

const rotasPrivadas = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/my-bookings', element: <MyBookings /> },
];

const rotasAdmin = [
  { path: '/admin', element: <AdminDashboard /> },
];

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <Routes>
          {/* Rotas Públicas */}
          {rotasPublicas.map((rota) => (
            <Route key={rota.path} path={rota.path} element={rota.element} />
          ))}

          {/* Rotas de Utilizador (Privadas) */}
          {rotasPrivadas.map((rota) => (
            <Route 
              key={rota.path} 
              path={rota.path} 
              element={<RotaPrivada>{rota.element}</RotaPrivada>} 
            />
          ))}

          {/* Rotas de Admin */}
          {rotasAdmin.map((rota) => (
            <Route 
              key={rota.path} 
              path={rota.path} 
              element={<RotaAdmin>{rota.element}</RotaAdmin>} 
            />
          ))}

          {/* Redirecionamento Padrão */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;