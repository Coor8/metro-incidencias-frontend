import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css'; // Estilos para la barra

const Header = () => {
  const rol = localStorage.getItem('rol');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('rol');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <img src="/logo-metro.png" alt="Metro CDMX" className="navbar-logo" />
      <nav className="navbar-links">
        {token ? (
          <>
            <Link to="/incidents">Incidencias</Link>
            {rol === 'admin' && <Link to="/admin">Panel de Administración</Link>}
            <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
          </>
        ) : (
          <>
            <Link to="/login">Iniciar Sesión</Link>
            <Link to="/register">Registrarse</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
