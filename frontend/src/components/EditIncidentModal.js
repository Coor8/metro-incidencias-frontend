import React, { useState } from "react";
import "./EditIncidentModal.css";
import { toast } from "react-toastify";

const estados = ["Pendiente", "En revisión", "Resuelto"];

const estacionesLinea8 = [
  "Garibaldi", "Bellas Artes", "San Juan de Letrán", "Salto del Agua", "Doctores",
  "Obrera", "Chabacano", "La Viga", "Santa Anita", "Coyuya", "Iztacalco", "Apatlaco",
  "Aculco", "Escuadrón 201", "Atlalilco", "Iztapalapa", "Cerro de la Estrella",
  "UAM-I", "Constitución de 1917"
];

const EditIncidentModal = ({ incidente, onClose, onUpdated }) => {
  const [tipo, setTipo] = useState(incidente.tipo);
  const [descripcion, setDescripcion] = useState(incidente.descripcion);
  const [estado, setEstado] = useState(incidente.estado);
  const [estacion, setEstacion] = useState(incidente.estacion || "");
  const [numeroReporte, setNumeroReporte] = useState(incidente.numeroReporte || ""); 

  const handleGuardar = async () => {
    const token = localStorage.getItem("token"); // 🔑 Asegúrate de que tengas el token aquí

    if (!token) {
        toast.error("No se encontró un token de autenticación. Inicia sesión nuevamente.");
        return;
    }

    try {
        const response = await fetch(`https://metro-incidencias.onrender.com/api/incidents/${incidente._id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // 🔑 Asegúrate de enviar el token aquí
            },
            body: JSON.stringify({ tipo, descripcion, estado, estacion, numeroReporte })
        });

        if (!response.ok) throw new Error("Error al actualizar");

        const updated = await response.json();
        toast.success("Incidencia actualizada correctamente");
        onUpdated(updated);
        onClose();
    } catch (err) {
        toast.error("Error al actualizar la incidencia");
    }
};

  return (
    <div className="modal-overlay">
      <div className="modal-contenido">
        <h3>Editar Incidencia</h3>

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
        ></textarea>

        <select value={estacion} onChange={(e) => setEstacion(e.target.value)} required>
          <option value="">Selecciona una estación</option>
          {estacionesLinea8.map((est) => (
            <option key={est} value={est}>{est}</option>
          ))}
        </select>

        <select value={estado} onChange={(e) => setEstado(e.target.value)} required>
          {estados.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>

        <div className="modal-buttons">
          <button onClick={handleGuardar} className="btn-guardar">Guardar</button>
          <button onClick={onClose} className="btn-cancelar">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default EditIncidentModal;
