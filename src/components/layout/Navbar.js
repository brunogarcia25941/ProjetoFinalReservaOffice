import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Navbar({ user, logout, isAdmin = false }) {
  const location = useLocation();
  const { selectedOffice, setSelectedOffice, offices } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const getIniciais = (nome) => {
    if (!nome) return 'U';
    const partes = nome.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return partes[0][0].toUpperCase();
  };

  const navClass = isAdmin
    ? "bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-3 sticky top-0 z-50"
    : "bg-white border-b border-gray-200 px-4 md:px-6 py-3 sticky top-0 z-50";

  const textClass = isAdmin ? "text-white" : "text-gray-800";
  const linkClass = isAdmin ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-primary";
  const activeLinkClass = isAdmin ? "text-white font-bold" : "text-primary border-b-0 md:border-b-2 border-primary pb-0 md:pb-1 font-bold";

  return (
    <nav className={navClass}>
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Brand/Logo Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-8 h-8 object-cover rounded-lg"
              />
            </div>
            <span className={`text-lg sm:text-xl font-bold ${textClass} truncate max-w-[180px] sm:max-w-none`}>
              {isAdmin ? "Admin - Reserva Office" : "Reserva Office"}
            </span>
          </div>

          {/* Desktop Office Selector */}
          {offices && offices.length > 0 && (
            <div className="hidden md:flex items-center gap-1.5 ml-2">
              <svg className={`w-4 h-4 ${isAdmin ? "text-gray-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              <select
                value={selectedOffice}
                onChange={(e) => setSelectedOffice(e.target.value)}
                className={`text-xs font-semibold rounded-lg border px-2.5 py-1 focus:outline-none transition-all cursor-pointer ${
                  isAdmin 
                    ? "bg-gray-800 border-gray-700 text-gray-200 focus:border-admin"
                    : "bg-gray-50 border-gray-200 text-gray-700 focus:border-primary"
                }`}
              >
                {offices.map((office) => (
                  <option key={office} value={office} className={isAdmin ? "bg-gray-900" : "bg-white"}>
                    {office}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Desktop Menu */}
        <div className={`hidden md:flex items-center gap-4 text-sm font-medium ${linkClass}`}>
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
              <Link 
                to="/tickets" 
                className={location.pathname === '/tickets' ? activeLinkClass : linkClass}
              >
                Suporte / Avarias
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

            {!isAdmin && user?.role === 'tecnico' && (
              <span className="ml-1 text-[10px] font-bold uppercase tracking-wide bg-primary-soft text-primary-hover px-2 py-1 rounded">
                Técnico
              </span>
            )}
          </div>

          <button
            onClick={logout}
            className={`text-sm ml-2 font-medium ${isAdmin ? "text-red-400 hover:text-red-300" : "text-admin hover:text-admin-hover"}`}
          >
            Sair
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg focus:outline-none ${isAdmin ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className={`md:hidden mt-3 pt-3 border-t ${isAdmin ? "border-gray-800" : "border-gray-200"} space-y-4 pb-2 animate-fade-in`}>
          {/* Mobile Office Selector */}
          {offices && offices.length > 0 && (
            <div className="flex items-center justify-between px-2">
              <span className={`text-xs font-semibold ${isAdmin ? "text-gray-400" : "text-gray-500"} flex items-center gap-1.5`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                Escritório:
              </span>
              <select
                value={selectedOffice}
                onChange={(e) => setSelectedOffice(e.target.value)}
                className={`text-xs font-semibold rounded-lg border px-2.5 py-1.5 focus:outline-none transition-all cursor-pointer ${
                  isAdmin 
                    ? "bg-gray-800 border-gray-700 text-gray-200 focus:border-admin"
                    : "bg-gray-50 border-gray-200 text-gray-700 focus:border-primary"
                }`}
              >
                {offices.map((office) => (
                  <option key={office} value={office} className={isAdmin ? "bg-gray-900" : "bg-white"}>
                    {office}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex flex-col gap-2.5 px-2">
            {!isAdmin ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className={`text-sm py-1.5 ${location.pathname === '/dashboard' ? activeLinkClass : linkClass}`}
                >
                  Reservar Recurso
                </Link>
                <Link
                  to="/my-bookings"
                  onClick={() => setIsOpen(false)}
                  className={`text-sm py-1.5 ${location.pathname === '/my-bookings' ? activeLinkClass : linkClass}`}
                >
                  As Minhas Reservas
                </Link>
                <Link 
                  to="/tickets" 
                  onClick={() => setIsOpen(false)}
                  className={`text-sm py-1.5 ${location.pathname === '/tickets' ? activeLinkClass : linkClass}`}
                >
                  Suporte / Avarias
                </Link>
              </>
            ) : (
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className={`text-sm py-1.5 ${linkClass}`}>
                Voltar ao Portal Normal
              </Link>
            )}
          </div>

          <div className={`h-px ${isAdmin ? "bg-gray-800" : "bg-gray-200"} mx-2`}></div>

          {/* User Info & Logout */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isAdmin ? "bg-admin text-white" : "bg-gray-200 text-gray-600"}`}>
                {isAdmin ? "AD" : getIniciais(user?.name)}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${isAdmin ? "text-white" : "text-gray-800"}`}>
                  {isAdmin ? "Admin" : (user?.name || 'Utilizador')}
                </span>
                <div className="flex gap-1.5 mt-0.5">
                  {!isAdmin && user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="text-[9px] font-bold uppercase tracking-wide bg-admin-light text-admin-hover px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Admin
                    </Link>
                  )}
                  {!isAdmin && user?.role === 'tecnico' && (
                    <span className="text-[9px] font-bold uppercase tracking-wide bg-primary-soft text-primary-hover px-1.5 py-0.5 rounded">
                      Técnico
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => { setIsOpen(false); logout(); }}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                isAdmin 
                  ? "text-red-400 hover:text-red-300 border-red-900/30 bg-red-950/20" 
                  : "text-admin hover:text-admin-hover border-admin-light bg-admin-soft"
              }`}
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
