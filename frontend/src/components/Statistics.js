import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import './Statistics.css';

const Statistics = () => {
  const [incidencias, setIncidencias] = useState([]);
  const [incidenciasPorDia, setIncidenciasPorDia] = useState([]);
  const [incidenciasPorMes, setIncidenciasPorMes] = useState([]);
  const [incidenciasPorEstado, setIncidenciasPorEstado] = useState([]);
  const [estacionesUnicas, setEstacionesUnicas] = useState([]);
  const [filtroEstacion, setFiltroEstacion] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await api.get('/incidents');
        const incidencias = response.data;
        setIncidencias(incidencias);
        const estaciones = [...new Set(incidencias.map(inc => inc.estacion))];
        setEstacionesUnicas(estaciones);
        actualizarGraficos(incidencias);
      } catch (error) {
        console.error('Error al obtener las estadísticas:', error);
      }
    };

    fetchStatistics();
  }, []);

  const actualizarGraficos = (incidenciasFiltradas) => {
    // Gráfico por día
    const incidenciasPorDia = Array(7).fill(0).map((_, i) => {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toLocaleDateString('en-CA');
      const cantidad = incidenciasFiltradas.filter(inc => {
        const fechaIncidencia = new Date(inc.fecha).toLocaleDateString('en-CA');
        return fechaIncidencia === fechaStr;
      }).length;
      return { fecha: fechaStr, cantidad };
    }).reverse();

    // Gráfico por mes - CORRECCIÓN DEFINITIVA
    const incidenciasPorMes = Array(12).fill(0).map((_, i) => {
      const fecha = new Date();
      fecha.setDate(1); // Fijar siempre al primer día del mes
      fecha.setMonth(fecha.getMonth() - i); // Restar meses correctamente
      
      const mesAnio = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const cantidad = incidenciasFiltradas.filter(inc => {
        const incDate = new Date(inc.fecha);
        const incMesAnio = `${incDate.getFullYear()}-${(incDate.getMonth() + 1).toString().padStart(2, '0')}`;
        return incMesAnio === mesAnio;
      }).length;

      return { mes: mesAnio, cantidad };
    }).reverse(); // Ordenar de más antiguo a más reciente

    // Gráfico por estado
    const incidenciasPorEstado = ['Pendiente', 'En revisión', 'Resuelto'].map(estado => ({
      estado,
      cantidad: incidenciasFiltradas.filter(inc => inc.estado === estado).length,
    }));

    setIncidenciasPorDia(incidenciasPorDia);
    setIncidenciasPorMes(incidenciasPorMes);
    setIncidenciasPorEstado(incidenciasPorEstado);
  };

  // Resto del código sin cambios...
  const filtrarDatos = () => {
    let filtradas = incidencias;

    if (filtroEstacion) {
      filtradas = filtradas.filter(inc => inc.estacion === filtroEstacion);
    }

    if (filtroEstado) {
      filtradas = filtradas.filter(inc => inc.estado === filtroEstado);
    }

    if (fechaInicio && fechaFin) {
      filtradas = filtradas.filter(inc => {
        const fechaIncidencia = new Date(inc.fecha);
        return fechaIncidencia >= new Date(fechaInicio) && fechaIncidencia <= new Date(fechaFin);
      });
    }

    actualizarGraficos(filtradas);
  };

  const limpiarFiltros = () => {
    setFiltroEstacion('');
    setFiltroEstado('');
    setFechaInicio('');
    setFechaFin('');
    actualizarGraficos(incidencias);
  };

  const exportToPDF = () => {
    html2canvas(chartRef.current).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
      pdf.save('estadisticas.pdf');
    });
  };

  const exportToImage = () => {
    html2canvas(chartRef.current).then((canvas) => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'estadisticas.png';
      link.click();
    });
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(incidencias);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estadísticas');
    XLSX.writeFile(workbook, 'estadisticas.xlsx');
  };

  return (
    <div className="statistics-container">
      <h2>Estadísticas de Incidencias</h2>

      <div className="filters">
        <select value={filtroEstacion} onChange={(e) => setFiltroEstacion(e.target.value)}>
          <option value="">Todas las Estaciones</option>
          {estacionesUnicas.map((estacion, index) => (
            <option key={index} value={estacion}>{estacion}</option>
          ))}
        </select>

        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los Estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En revisión">En revisión</option>
          <option value="Resuelto">Resuelto</option>
        </select>

        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />

        <button onClick={filtrarDatos}>Aplicar Filtros</button>
        <button onClick={limpiarFiltros}>Limpiar Filtros</button>
        <button onClick={exportToPDF}>Exportar a PDF</button>
        <button onClick={exportToImage}>Exportar a Imagen</button>
        <button onClick={exportToExcel}>Exportar a Excel</button>
      </div>

      <div ref={chartRef}>
        <div className="chart-container">
          <h3>Incidencias por Día (Últimos 7 días)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={incidenciasPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cantidad" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Incidencias por Mes (Últimos 12 meses)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={incidenciasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>


        <div className="chart-container">
        <h3>Incidencias por Estado</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={incidenciasPorEstado}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="estado" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cantidad">
              {incidenciasPorEstado.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    entry.estado === 'Pendiente' ? '#FF4D4D' : 
                    entry.estado === 'En revisión' ? '#F9D342' : 
                    '#4CAF50'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Statistics;