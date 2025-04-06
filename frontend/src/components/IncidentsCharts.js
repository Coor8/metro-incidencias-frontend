import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import './IncidentsCharts.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const IncidentsCharts = () => {
    const [incidents, setIncidents] = useState([]);
    const [dataPorDia, setDataPorDia] = useState([]);
    const [dataPorMes, setDataPorMes] = useState([]);
    const [dataPorAnio, setDataPorAnio] = useState([]);

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const response = await api.get('/incidents');
                setIncidents(response.data);
                procesarDatos(response.data);
            } catch (error) {
                console.error('Error al obtener incidencias:', error);
            }
        };
        fetchIncidents();
    }, []);

    const procesarDatos = (incidents) => {
        const porDia = {};
        const porMes = {};
        const porAnio = {};

        incidents.forEach(inc => {
            const fecha = new Date(inc.fecha);
            const dia = fecha.toLocaleDateString();
            const mes = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;
            const anio = fecha.getFullYear();

            porDia[dia] = (porDia[dia] || 0) + 1;
            porMes[mes] = (porMes[mes] || 0) + 1;
            porAnio[anio] = (porAnio[anio] || 0) + 1;
        });

        setDataPorDia(Object.entries(porDia).map(([key, value]) => ({ name: key, Incidencias: value })));
        setDataPorMes(Object.entries(porMes).map(([key, value]) => ({ name: key, Incidencias: value })));
        setDataPorAnio(Object.entries(porAnio).map(([key, value]) => ({ name: key, Incidencias: value })));
    };

    return (
        <div className="charts-container">
            <h2>Gráficos de Incidencias</h2>

            <div className="chart">
                <h3>Incidencias por Día</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dataPorDia}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Incidencias" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="chart">
                <h3>Incidencias por Mes</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dataPorMes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Incidencias" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart">
                <h3>Incidencias por Año</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={dataPorAnio}
                            dataKey="Incidencias"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            fill="#82ca9d"
                            label
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default IncidentsCharts;
