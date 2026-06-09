import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ user, logout, isAdmin = false }) {
  const location = useLocation();

  const getIniciais = (nome) => {
    if (!nome) return 'U';
    const partes = nome.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return partes[0][0].toUpperCase();
  };

  const navClass = isAdmin 
    ? "bg-gray-900 border-b border-gray-800 px-6 py-3 flex justify-between items-center sticky top-0 z-10"
    : "bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10";

  const textClass = isAdmin ? "text-white" : "text-gray-800";
  const linkClass = isAdmin ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-primary";
  const activeLinkClass = isAdmin ? "text-white" : "text-primary border-b-2 border-primary pb-1";

  return (
    <nav className={navClass}>
      <div className="flex items-center gap-2">
        <div className={isAdmin ? "bg-admin p-1.5 rounded-lg" : "bg-primary p-1.5 rounded-lg"}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isAdmin ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            )}
          </svg>
        </div>
        <span className={`text-xl font-bold ${textClass}`}>
          {isAdmin ? "Administração - Reserva Office" : "Reserva Office"}
        </span>
      </div>

      <div className={`flex items-center gap-4 text-sm font-medium ${linkClass}`}>
        {!isAdmin ? (
          <>
            <Link 
              to="/dashboard" 
              className={location.pathname === '/dashboard' ? activeLinkClass : linkClass}
            >
              Reservar Recurso
            </Link>
            <Link 
              to="/my-bookings" 
              className={location.pathname === '/my-bookings' ? activeLinkClass : linkClass}
            >
              As Minhas Reservas
            </Link>
          </>
        ) : (
          <Link to="/dashboard" className={linkClass}>Voltar ao Portal Normal</Link>
        )}
        
        <div className="w-px h-5 bg-gray-300 mx-2"></div>
        
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isAdmin ? "bg-admin text-white" : "bg-gray-200 text-gray-600"}`}>
            {isAdmin ? "AD" : getIniciais(user?.name)}
          </div>
          <span className={isAdmin ? "text-white" : "font-medium"}>
            {isAdmin ? "Admin" : (user?.name || 'Utilizador')}
          </span>

          {!isAdmin && user?.role === 'admin' && (
            <Link 
              to="/admin" 
              title="Ir para Administração" 
              className="ml-1 text-[10px] font-bold uppercase tracking-wide bg-admin-light text-admin-hover px-2 py-1 rounded hover:bg-admin-light/80 transition-colors cursor-pointer"
            >
              Admin
            </Link>
          )}
        </div>

        <button 
          onClick={logout} 
          className={`text-sm ml-2 font-medium ${isAdmin ? "text-red-400 hover:text-red-300" : "text-admin hover:text-admin-hover"}`}
        >
          Sair
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
