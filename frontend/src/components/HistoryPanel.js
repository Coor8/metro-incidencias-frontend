import React, { useEffect, useState, useCallback } from 'react'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './HistoryPanel.css';

const HistoryPanel = () => {
    const [historial, setHistorial] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const token = localStorage.getItem('token');

    const fetchHistorial = useCallback(async () => {
        try {
            const response = await fetch('https://metro-incidencias.onrender.com/api/users/history', { 
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (response.ok) {
                setHistorial(data);
            } else {
                toast.error(data.message || 'Error al cargar el historial de actualizaciones.');
            }
        } catch (error) {
            toast.error('Error al cargar el historial de actualizaciones.');
        }
    }, [token]); 

    useEffect(() => {
        fetchHistorial();
    }, [fetchHistorial]); 

    const filteredHistorial = historial.filter(registro => 
        registro.tipoRecurso.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registro.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registro.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (registro.usuarioModificador || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastRecord = currentPage * itemsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
    const currentRecords = filteredHistorial.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredHistorial.length / itemsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    // 🔥 Nueva función para limpiar el historial viejo
    const limpiarHistorialViejo = async () => {
        const confirmDelete = window.confirm("¿Deseas limpiar registros antiguos del historial?");
        if (!confirmDelete) return;

        try {
            const response = await fetch('https://metro-incidencias.onrender.com/api/history/clean?days=7', {  
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                fetchHistorial(); // Refrescar la lista después de la limpieza
            } else {
                toast.error(data.message || 'Error al limpiar el historial.');
            }
        } catch (error) {
            toast.error('Error al limpiar el historial.');
        }
    };

    return (
        <div className="history-panel-container">
            <h1>Historial de Actualizaciones</h1>

            <div className="search-and-clean-container">
                <input 
                    type="text" 
                    placeholder="Buscar en el historial..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                />
                <button 
                    className="btn-limpiar"
                    onClick={limpiarHistorialViejo}
                >
                    Limpiar Registros Viejos
                </button>
            </div>

            <table className="history-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Tipo de Recurso</th>
                        <th>Acción</th>
                        <th>Descripción</th>
                        <th>Modificado por</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRecords.length > 0 ? (
                        currentRecords.map((registro) => (
                            <tr key={registro._id}>
                                <td>{new Date(registro.fecha).toLocaleString()}</td>
                                <td>{registro.tipoRecurso}</td>
                                <td>{registro.accion}</td>
                                <td>{registro.descripcion}</td>
                                <td>{registro.usuarioModificador || 'Desconocido'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No se encontraron registros.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="pagination-controls">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                >
                    Anterior
                </button>

                {currentPage > 3 && (
                    <>
                        <button onClick={() => handlePageChange(1)}>1</button>
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
                            onClick={() => handlePageChange(pageNumber)}
                            className={currentPage === pageNumber ? 'active' : ''}
                        >
                            {pageNumber}
                        </button>
                    ))
                }

                {currentPage < totalPages - 2 && (
                    <>
                        {currentPage < totalPages - 3 && <span>...</span>}
                        <button onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
                    </>
                )}

                <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                >
                    Siguiente
                </button>
            </div>

            <ToastContainer />
        </div>
    );
};

export default HistoryPanel;