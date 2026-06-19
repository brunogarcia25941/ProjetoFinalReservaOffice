import React, { useContext } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import TicketsDashboard from './pages/TicketsDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ForcePasswordChange from './components/ForcePasswordChange';

// Componente para proteger rotas que exigem login
const RotaPrivada = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  if (!token) {
    return <Navigate to="/login" />;
  }
  if (user?.must_change_password) {
    return <ForcePasswordChange />;
  }
  return children;
};

// Componente para proteger rotas exclusivas de Admin
const RotaAdmin = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  if (!token || user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  if (user?.must_change_password) {
    return <ForcePasswordChange />;
  }
  return children;
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
  { path: '/tickets', element: <TicketsDashboard /> },
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