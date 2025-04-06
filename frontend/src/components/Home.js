import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token');

  // Redirige automáticamente si ya hay sesión activa
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/incidents');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="home-container">
      <h1>¡Bienvenido al sistema de incidencias!</h1>

      {!isAuthenticated && (
        <div className="home-buttons">
          <Link to="/login">Iniciar Sesión</Link>
          <Link to="/register">Registrarse</Link>
        </div>
      )}
    </div>
  );
};

export default Home;
