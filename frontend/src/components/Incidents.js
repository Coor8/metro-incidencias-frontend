/*Inicio de codigo*/
import React, { useEffect, useState } from 'react'; 
import { api } from '../services/api';
import './Incidents.css';
import { FaTrash, FaPen, FaSearch, FaFilePdf } from 'react-icons/fa';
import EditIncidentModal from './EditIncidentModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import m from './m.png';

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [incidenteSeleccionado, setIncidenteSeleccionado] = useState(null);
  const [filtroEstacion, setFiltroEstacion] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const navigate = useNavigate();
  const rol = localStorage.getItem('rol') || 'usuario'; // Si no se encuentra, asigna 'usuario'


  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const token = localStorage.getItem('token'); // ✅ Obtén el token del localStorage
        const response = await api.get('/incidents', {
          headers: { Authorization: `Bearer ${token}` } // ✅ Enviar token con la solicitud
        });
        setIncidents(response.data);
      } catch (error) {
        console.error('Error al obtener incidencias:', error);
      }
    };
    fetchIncidents();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroEstacion, filtroEstado, searchTerm, fechaInicio, fechaFin]);

  const handleDelete = async (id) => {
    
    if (rol !== 'admin') {
      toast.error("No tienes permisos para eliminar esta incidencia.");
      return;
    }

    const confirmDelete = window.confirm("¿Estás seguro de eliminar esta incidencia?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token'); // ✅ Obtén el token
      await api.delete(`/incidents/${id}`, {
        headers: { Authorization: `Bearer ${token}` } // ✅ Enviar token con la solicitud
      });
      setIncidents(incidents.filter((inc) => inc._id !== id));
      toast.success("Incidencia eliminada correctamente");
    } catch (error) {
      toast.error("Error al eliminar la incidencia");
    }
  };

  const abrirModalEdicion = (incidente) => {
    if (rol !== 'admin') {  // ✅ Permitir editar solo si el rol es admin
      toast.error("No tienes permisos para editar esta incidencia.");
      return;
    }
    setIncidenteSeleccionado(incidente);
    setModalAbierto(true);
  };
  
  const handleShowDescription = (descripcion) => {
    setSelectedDescription(descripcion);
    setShowDescriptionModal(true);
  };

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'estado pendiente';
      case 'En revisión':
        return 'estado revision';
      case 'Resuelto':
        return 'estado resuelto';
      default:
        return 'estado';
    }
  };

  const handleExportPDF = (inc) => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = m;

    img.onload = () => {
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        const usableWidth = pageWidth - margin * 2;
        let yPos = 20;
        
        doc.addImage(img, 'PNG', margin, yPos, 30, 30);
        doc.setFontSize(12);
        doc.setFont('Helvetica', 'bold');
        doc.text('Reporte de Incidencia - Línea 8', pageWidth / 2, yPos + 10, { align: 'center' });

        yPos += 40;

        const contenido = [
            `Número de Reporte: ${inc.numeroReporte || 'No asignado'}`,
            `Tipo: ${inc.tipo || 'Sin especificar'}`,
            `Descripción: ${inc.descripcion || 'Sin descripción'}`,
            `Línea: ${inc.linea || 'Línea 8'}`,
            `Estación: ${inc.estacion || 'Sin especificar'}`,
            `Estado: ${inc.estado || 'Sin especificar'}`,
            `Fecha del Incidente: ${new Date(inc.fecha).toLocaleString() || 'Sin fecha'}`
        ];

        contenido.forEach(linea => {
            const lineHeight = 10;
            const splitText = doc.splitTextToSize(linea, usableWidth);
            splitText.forEach((line) => {
                doc.text(line, margin, yPos);
                yPos += lineHeight;

                if (yPos >= doc.internal.pageSize.height - 20) { 
                    doc.addPage();
                    yPos = margin;
                }
            });
        });

        const fechaGeneracion = new Date().toLocaleString();
        doc.setFontSize(10);
        doc.text(`Generado el: ${fechaGeneracion}`, margin, doc.internal.pageSize.height - 10);

        doc.save(`Reporte_${inc.numeroReporte || 'Incidencia'}.pdf`);
    };
  };

  const itemsPerPage = 6;
  const incidenciasFiltradas = incidents.filter((inc) => {
    const tipo = inc.tipo ? inc.tipo.toLowerCase() : '';
    const descripcion = inc.descripcion ? inc.descripcion.toLowerCase() : '';
    const estacion = inc.estacion ? inc.estacion.toLowerCase() : '';
    const numeroReporte = inc.numeroReporte ? inc.numeroReporte.toLowerCase() : '';
    
    const incluyeBusqueda = 
      tipo.includes(searchTerm.toLowerCase()) ||
      descripcion.includes(searchTerm.toLowerCase()) ||
      estacion.includes(searchTerm.toLowerCase()) ||
      numeroReporte.includes(searchTerm.toLowerCase());

    // Corrección clave para el filtrado de fechas
    const fechaIncidente = new Date(inc.fecha);
    const cumpleFechaInicio = fechaInicio 
      ? fechaIncidente >= new Date(fechaInicio)
      : true;

    const cumpleFechaFin = fechaFin 
      ? fechaIncidente <= new Date(`${fechaFin}T23:59:59`) // Incluye todo el día
      : true;

    return (
      (!filtroEstacion || inc.estacion === filtroEstacion) &&
      (!filtroEstado || inc.estado === filtroEstado) &&
      incluyeBusqueda &&
      cumpleFechaInicio &&
      cumpleFechaFin
    );
  });

  const totalPages = Math.ceil(incidenciasFiltradas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIncidents = incidenciasFiltradas.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [incidenciasFiltradas, currentPage, totalPages]);

  const estacionesUnicas = [...new Set(incidents.map((i) => i.estacion))];
  const estadosUnicos = [...new Set(incidents.map((i) => i.estado))];

  return (
    <div className="incidents-container">
      <div className="incidents-header">
        <h2>Lista de Incidencias</h2>
        <button 
          className="btn-nueva animate-click" 
          onClick={() => navigate('/incidents/create')}
        >
          + Nueva Incidencia
        </button>
      </div>

      <div className="filtros-container">
        <select value={filtroEstacion} onChange={(e) => setFiltroEstacion(e.target.value)}>
          <option value="">Todas las estaciones</option>
          {estacionesUnicas.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>

        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {estadosUnicos.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>

        <input 
          type="date" 
          value={fechaInicio} 
          onChange={(e) => setFechaInicio(e.target.value)} 
          placeholder="Fecha de inicio"
        />

        <input 
          type="date" 
          value={fechaFin} 
          onChange={(e) => setFechaFin(e.target.value)} 
          placeholder="Fecha de fin"
        />

        <button className="btn-limpiar" onClick={() => { 
          setFiltroEstacion(''); 
          setFiltroEstado(''); 
          setSearchTerm('');
          setFechaInicio('');
          setFechaFin('');
        }}>
          Limpiar filtros
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por tipo, descripción, estación o número de reporte..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch className="search-icon" />
      </div>

      <table className="incidents-table">
        <thead>
          <tr>
            <th>Número de Reporte</th>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Línea</th>
            <th>Estación</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentIncidents.map((inc) => (
            <tr key={inc._id}>
              <td>{inc.numeroReporte || 'Sin número'}</td>
              <td>{inc.tipo}</td>
              <td 
                className="clickable-description"
                onClick={() => handleShowDescription(inc.descripcion)}
                title="Click para ver completo"
              >
                {inc.descripcion}
              </td>
              <td>{inc.linea}</td>
              <td>{inc.estacion}</td>
              <td>
                <span className={getEstadoClass(inc.estado)}>{inc.estado}</span>
              </td>
              <td>{new Date(inc.fecha).toLocaleString()}</td>
              <td>
              <button className="icono-btn" onClick={() => handleExportPDF(inc)}>
                  <FaFilePdf style={{ color: 'red' }} />
              </button>
              {rol === 'admin' && (  // ✅ Mostrar botones solo si el rol es admin
                  <>
                      <button 
                          className="icono-btn icono-editar" 
                          onClick={() => abrirModalEdicion(inc)}
                      >
                          <FaPen style={{ color: 'orange' }} />
                      </button>
                      <button 
                          className="icono-btn icono-eliminar" 
                          onClick={() => handleDelete(inc._id)}
                      >
                          <FaTrash style={{ color: 'red' }} />
                      </button>
                  </>
              )}
          </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 0 && (
    <div className="pagination-controls">
        <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
        >
            Anterior
        </button>

        {currentPage > 3 && (
            <>
                <button onClick={() => setCurrentPage(1)}>1</button>
                {currentPage > 4 && <span>...</span>}
            </>
        )}

        {Array.from({ length: totalPages }, (_, index) => index + 1)
            .filter(pageNumber => 
                pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2
            )
            .map(pageNumber => (
                <button 
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={currentPage === pageNumber ? 'active' : ''}
                >
                    {pageNumber}
                </button>
            ))
        }

        {currentPage < totalPages - 2 && (
            <>
                {currentPage < totalPages - 3 && <span>...</span>}
                <button onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
            </>
        )}

        <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
        >
            Siguiente
        </button>
    </div>
    )}


        {modalAbierto && incidenteSeleccionado && rol === 'admin' && ( // ✅ Protección por rol
            <EditIncidentModal
                incidente={incidenteSeleccionado}
                onClose={() => setModalAbierto(false)}
                onUpdated={(actualizado) => {
                    setIncidents(incidents.map((inc) =>
                      inc._id === actualizado._id ? actualizado : inc
                    ));
                    setModalAbierto(false);
                }}
            />
        )}

      {showDescriptionModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowDescriptionModal(false)} />
          <div className="description-modal">
            <div className="modal-header">
              <h3> Descripción Completa</h3>
              <button 
                className="btn-cerrar"
                onClick={() => setShowDescriptionModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              {selectedDescription || "Sin descripción"}
            </div>
          </div>
        </>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default Incidents;