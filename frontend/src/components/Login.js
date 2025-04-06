import React, { useState } from "react";
import "./Login.css"; 
import { ToastContainer, toast } from "react-toastify"; 
import 'react-toastify/dist/ReactToastify.css'; 
import { FaEye, FaEyeSlash } from "react-icons/fa"; 

const Login = () => {
    const [correo, setCorreo] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [mostrarContraseña, setMostrarContraseña] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("https://metro-incidencias.onrender.com/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, contraseña }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Error en el login");
            }

            // ✅ Asegúrate de que el backend envíe correctamente el token, refreshToken y rol del usuario
            if (data.token && data.refreshToken && data.usuario && data.usuario.rol) {  // ✅ Cambié esta línea
                localStorage.setItem("token", data.token);  // Guardar el token de acceso
                localStorage.setItem("refreshToken", data.refreshToken);  // Guardar el refreshToken
                localStorage.setItem("rol", data.usuario.rol); // ✅ Guardar el rol del usuario (admin o usuario)

                toast.success("Inicio de sesión exitoso 🎉");

                setTimeout(() => {
                    window.location.href = "/incidents"; // Redirige a la página de incidencias
                }, 2000);
            } else {
                throw new Error("No se pudo obtener la información del usuario.");
            }

        } catch (error) {
            console.error("Error en login:", error);
            toast.error(error.message || "Error en el login");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                {/* Sección izquierda con la imagen */}
                <div className="login-left">
                    <img src="/linea 8.png" alt="Metro CDMX" className="metro-logo" />
                    <h2>¡Bienvenido al Sistema!</h2>
                    <p>Accede para gestionar las incidencias del Metro CDMX.</p>
                </div>

                {/* Sección derecha con el formulario */}
                <div className="login-right">
                    <h2>Iniciar Sesión</h2>
                    <form onSubmit={handleLogin}>
                        <label>Correo:</label>
                        <input
                            type="email"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                            placeholder="Ejemplo: usuario@correo.com"
                        />

                        <label>Contraseña:</label>
                        <div className="password-container">
                            <input
                                type={mostrarContraseña ? "text" : "password"}
                                value={contraseña}
                                onChange={(e) => setContraseña(e.target.value)}
                                required
                                placeholder="Ingresa tu contraseña"
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setMostrarContraseña(!mostrarContraseña)}
                            >
                                {mostrarContraseña ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <button type="submit" className="login-button">Iniciar Sesión</button>
                    </form>
                </div>
            </div>
            <ToastContainer /> 
        </div>
    );
};

export default Login;
