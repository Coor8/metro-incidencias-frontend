import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import './Charts.css';

const Charts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [periodo, setPeriodo] = useState('dia');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/incidents');
        const incidents = response.data;

        const filteredIncidents = incidents.filter(inc => {
          return (
            (!filterEstado || inc.estado === filterEstado) &&
            (!filterTipo || inc.tipo === filterTipo)
          );
        });

        const incidenciasAgrupadas = filteredIncidents.reduce((acc, incident) => {
          const fecha = new Date(incident.fecha);
          let key;

          switch (periodo) {
            case 'dia':
              key = fecha.toLocaleDateString('en-CA'); // Cambiado para evitar diferencias de zona horaria
              break;
            case 'semana':
              const semana = Math.ceil((fecha.getDate() - 1) / 7);
              key = `${fecha.getFullYear()}-Semana${semana}`;
              break;
            case 'mes':
              key = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
              break;
            case 'año':
              key = fecha.getFullYear().toString();
              break;
            default:
              key = fecha.toLocaleDateString('en-CA'); // Aseguramos compatibilidad de formato
          }

          if (!acc[key]) acc[key] = 0;
          acc[key]++;
          return acc;
        }, {});

        const formattedData = Object.keys(incidenciasAgrupadas).map(date => ({
          fecha: date,
          total: incidenciasAgrupadas[date]
        }));

        formattedData.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        setData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener incidencias:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [filterEstado, filterTipo, periodo]);

  if (loading) return <div>Cargando gráficas...</div>;

  return (
    <div className="charts-container">
      <h2>Gráficos de Incidencias</h2>

      <div className="filters">
        <select onChange={(e) => setFilterEstado(e.target.value)} value={filterEstado}>
          <option value="">Todos los Estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En revisión">En revisión</option>
          <option value="Resuelto">Resuelto</option>
        </select>

        <select onChange={(e) => setFilterTipo(e.target.value)} value={filterTipo}>
          <option value="">Todos los Tipos</option>
          <option value="Falla Mecánica">Falla Mecánica</option>
          <option value="Retraso">Retraso</option>
          <option value="Accidente">Accidente</option>
        </select>

        <select onChange={(e) => setPeriodo(e.target.value)} value={periodo}>
          <option value="dia">Por Día</option>
          <option value="semana">Por Semana</option>
          <option value="mes">Por Mes</option>
          <option value="año">Por Año</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#009933" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;

