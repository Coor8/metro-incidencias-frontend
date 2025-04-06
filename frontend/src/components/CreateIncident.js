import React, { useState } from "react";
import { api } from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CreateIncident.css";

const estacionesLinea8 = [
  "Garibaldi", "Bellas Artes", "San Juan de Letrán", "Salto del Agua", "Doctores",
  "Obrera", "Chabacano", "La Viga", "Santa Anita", "Coyuya", "Iztacalco", "Apatlaco",
  "Aculco", "Escuadrón 201", "Atlalilco", "Iztapalapa", "Cerro de la Estrella",
  "UAM-I", "Constitución de 1917"
];

const estadosIncidencia = [
  { label: "Pendiente", color: "#e74c3c" },
  { label: "En revisión", color: "#f1c40f" },
  { label: "Resuelto", color: "#2ecc71" }
];

const CreateIncident = () => {
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estacion, setEstacion] = useState("");
  const [estado, setEstado] = useState("Pendiente");
  const [numeroReporte, setNumeroReporte] = useState(""); // Nuevo campo

  const validarTipo = (tipo) => {
    const regex = /[a-zA-Z]/;
    return regex.test(tipo.trim());
  };

  const validarEstacion = (estacion) => {
    return estacionesLinea8.includes(estacion);
  };

  const validarEstado = (estado) => {
    return estadosIncidencia.some((item) => item.label === estado);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarTipo(tipo)) {
      toast.error("El tipo de incidencia debe contener al menos una letra.");
      return;
    }

    if (descripcion.trim().length === 0) {
      toast.error("La descripción no puede estar vacía.");
      return;
    }

    if (!validarEstacion(estacion)) {
      toast.error("Debes seleccionar una estación válida de la Línea 8.");
      return;
    }

    if (!validarEstado(estado)) {
      toast.error("Debes seleccionar un estado válido.");
      return;
    }

    if (numeroReporte.trim().length === 0) {
      toast.error("El número de reporte no puede estar vacío.");
      return;
    }

    const nuevaIncidencia = {
      numeroReporte, // <-- Se agrega al objeto que se envía al backend
      tipo,
      descripcion,
      linea: "Línea 8",
      estacion,
      estado,
      fecha: new Date().toISOString()
    };

    try {
      await api.post("/incidents", nuevaIncidencia);
      toast.success("Incidencia registrada correctamente");
      setTipo("");
      setDescripcion("");
      setEstacion("");
      setEstado("Pendiente");
      setNumeroReporte(""); // Limpiar número de reporte
    } catch (error) {
      toast.error("Error al registrar la incidencia");
    }
  };

  return (
    <div className="incident-form-container">
      <h2>Registrar Nueva Incidencia</h2>
      <form onSubmit={handleSubmit} className="incident-form">
        
        {/* Número de Reporte */}
        <input
          type="text"
          placeholder="Número de Reporte"
          value={numeroReporte}
          onChange={(e) => setNumeroReporte(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Tipo de incidencia"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
        />

        <textarea
          placeholder="Descripción detallada"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          style={{ resize: "none" }}
        ></textarea>

        <input
          type="text"
          value="Línea 8"
          disabled
          className="linea-fija"
        />

        <select
          value={estacion}
          onChange={(e) => setEstacion(e.target.value)}
          required
        >
          <option value="">Selecciona una estación</option>
          {estacionesLinea8.map((est) => (
            <option key={est} value={est}>{est}</option>
          ))}
        </select>

        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          required
        >
          <option value="">Selecciona el estado</option>
          {estadosIncidencia.map((item) => (
            <option key={item.label} value={item.label}>{item.label}</option>
          ))}
        </select>

        <button type="submit" className="btn-submit">Registrar</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default CreateIncident;
