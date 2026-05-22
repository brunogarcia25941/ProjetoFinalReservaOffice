import React, { useContext } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext'; 
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RotaProtegida({ children }) {
  const { token } = useContext(AuthContext);
  // Se não houver token, redireciona o utilizador para o login
  if (!token) return <Navigate to="/login" />;
  return children;
}

function RotaAdmin({ children }) {
  const { token, user } = useContext(AuthContext);
  // Se não houver token ou o utilizador não for admin, redireciona-o
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" hideProgressBar={false} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Dashboard envolvido pela RotaProtegida */}
          <Route path="/dashboard" element={
            <RotaProtegida>
              <Dashboard />
            </RotaProtegida>
          } />
          <Route path="/minhas-reservas" element={
            <RotaProtegida>
              <MyBookings />
            </RotaProtegida>
          } />
          <Route path="/admin" element={
            <RotaAdmin>
              <AdminDashboard />
            </RotaAdmin>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;