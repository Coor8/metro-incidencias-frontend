import React, { useState, useEffect } from "react"; 
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Incidents from "./components/Incidents";
import CreateIncident from "./components/CreateIncident";
import Charts from "./components/Charts";
import Statistics from "./components/Statistics";
import Logout from "./components/Logout";
import AdminPanel from "./components/AdminPanel"; 
import HistoryPanel from "./components/HistoryPanel"; 
import { FaSignOutAlt, FaBars, FaMoon, FaSun } from "react-icons/fa";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [rol, setRol] = useState(localStorage.getItem("rol") || "");
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("darkMode") === "true");

  const toggleMenu = () => setMenuAbierto(!menuAbierto);
  const cerrarMenu = () => setMenuAbierto(false);

  // ✅ Función para cambiar entre Modo Claro y Oscuro
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.body.classList.toggle("dark-mode", newMode);
  };

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const verificarAutenticacion = () => {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("rol");
      setIsAuthenticated(!!token);
      setRol(userRole || "");
    };

    window.addEventListener("storage", verificarAutenticacion);
    return () => window.removeEventListener("storage", verificarAutenticacion);
  }, []);

  return (
    <Router>
      <AppContent
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        menuAbierto={menuAbierto}
        toggleMenu={toggleMenu}
        cerrarMenu={cerrarMenu}
        rol={rol}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    </Router>
  );
}

const AppContent = ({ isAuthenticated, setIsAuthenticated, menuAbierto, toggleMenu, cerrarMenu, rol, isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("rol");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className={`app-container ${isDarkMode ? "dark" : ""}`}>
      <nav className="navbar">
        <Link to="/" className="logo" onClick={cerrarMenu}>
          <img src="/m.png" alt="MetroCDMX" className="logo-img" />
        </Link>

        <div className="mode-switch" onClick={toggleDarkMode}>
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </div>

        <button className="menu-toggle" onClick={toggleMenu}>
          <FaBars />
        </button>

        <div className={`nav-links ${menuAbierto ? "show" : ""}`}>
          {!isAuthenticated ? (
            <>
              <Link to="/login" onClick={cerrarMenu}>Iniciar Sesión</Link>
              <Link to="/register" onClick={cerrarMenu}>Registrarse</Link>
            </>
          ) : (
            <>
              <Link to="/incidents" onClick={cerrarMenu}>Incidencias</Link>
              <Link to="/incidents/create" onClick={cerrarMenu}>Nueva Incidencia</Link>
              <Link to="/charts" onClick={cerrarMenu}>Gráficos</Link>
              <Link to="/statistics" onClick={cerrarMenu}>Estadísticas</Link>
              {rol === "admin" && <Link to="/admin" onClick={cerrarMenu}>Panel de Administración</Link>}
              {rol === "admin" && <Link to="/history" onClick={cerrarMenu}>Historial de Actualizaciones</Link>}
              <button className="logout-button" onClick={handleLogout}>
                <FaSignOutAlt style={{ marginRight: "6px" }} /> Cerrar Sesión
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          {isAuthenticated && <Route path="/incidents" element={<Incidents />} />}
          {isAuthenticated && <Route path="/incidents/create" element={<CreateIncident />} />}
          {isAuthenticated && <Route path="/charts" element={<Charts />} />}
          {isAuthenticated && <Route path="/statistics" element={<Statistics />} />}
          {isAuthenticated && rol === "admin" && <Route path="/admin" element={<AdminPanel />} />}
          {isAuthenticated && rol === "admin" && <Route path="/history" element={<HistoryPanel />} />}
          <Route path="/logout" element={<Logout setIsAuthenticated={setIsAuthenticated} />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
