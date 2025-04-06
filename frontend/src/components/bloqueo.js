import React, { useState } from 'react';
import { api } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // 👈 Importa Link para la navegación
import './Register.css';

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mostrarContraseña, setMostrarContraseña] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/register', { nombre, correo, contraseña });

      if (response.status === 201) {
        toast.success("Registro exitoso. Ahora puedes iniciar sesión.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error en el registro');
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registrarse</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <div className="password-container">
            <input
              type={mostrarContraseña ? "text" : "password"}
              placeholder="Contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setMostrarContraseña(!mostrarContraseña)}
            >
              {mostrarContraseña ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button type="submit" className="btn-register">Registrarse</button>
        </form>

        {/* 👇 Enlace para redirigir al login */}
        <p className="redirect-text">
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
        </p>

        <ToastContainer />
      </div>
    </div>
  );
};

export default Register;
