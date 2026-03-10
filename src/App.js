import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';

// Componente "Guardião" (PrivateRoute)
// Bloqueia o acesso a rotas sensíveis. Se não houver token no browser, 
// expulsa o utilizador e reencaminha-o para o ecrã de Login ("/").
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/" />;
};

function App() {
    return (
        // Envolvemos toda a aplicação no AuthProvider para que a sessão exista globalmente
        <AuthProvider>
            <Router>
                <Routes>
                    {/* ROTA PÚBLICA: Qualquer pessoa pode ver o Login */}
                    <Route path="/" element={<Login />} />

                    {/* ROTAS PRIVADAS: Protegidas pelo nosso Guardião (PrivateRoute) */}
                    <Route 
                        path="/dashboard" 
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/my-bookings" 
                        element={
                            <PrivateRoute>
                                <MyBookings />
                            </PrivateRoute>
                        } 
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;