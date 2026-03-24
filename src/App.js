import React, { useContext } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';

function RotaProtegida({ children }) {
  const { token } = useContext(AuthContext);
  // Se não houver token, recambia o utilizador para o login
  if (!token) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
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
            <RotaProtegida>
              <AdminDashboard />
            </RotaProtegida>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;