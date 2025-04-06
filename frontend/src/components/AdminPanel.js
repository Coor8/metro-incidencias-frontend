import React, { useEffect, useState, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import 'react-toastify/dist/ReactToastify.css';
import './AdminPanel.css';

const AdminPanel = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [rol, setRol] = useState('usuario');
    const [editando, setEditando] = useState(false);
    const [usuarioEditado, setUsuarioEditado] = useState(null);
    const [token] = useState(localStorage.getItem('token'));
    const [mostrarContraseña, setMostrarContraseña] = useState(false);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    const fetchUsuarios = useCallback(async () => {
        try {
            const response = await fetch('https://metro-incidencias.onrender.com/api/users', {  
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (response.ok) {
                setUsuarios(data);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error('Error al cargar usuarios');
        }
    }, [token]);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const endpoint = editando 
                ? `https://metro-incidencias.onrender.com/api/users/${usuarioEditado._id}` 
                : 'https://metro-incidencias.onrender.com/api/users/register';
            const method = editando ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nombre, correo, contraseña, rol })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al guardar usuario');
            }

            toast.success(editando ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
            setNombre('');
            setCorreo('');
            setContraseña('');
            setRol('usuario');
            setEditando(false);
            setUsuarioEditado(null);
            fetchUsuarios();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`https://metro-incidencias.onrender.com/api/users/${id}`, {  
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar usuario');
            }

            toast.success('Usuario eliminado correctamente');
            fetchUsuarios();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEdit = (usuario) => {
        setEditando(true);
        setUsuarioEditado(usuario);
        setNombre(usuario.nombre);
        setCorreo(usuario.correo);
        setRol(usuario.rol);
    };

    useEffect(() => {
        fetchUsuarios();
    }, [fetchUsuarios]); 

    // Paginación lógica
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = usuarios.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(usuarios.length / usersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="admin-panel-container">
            <h1>Panel de Administración</h1>

            <form onSubmit={handleRegister} className="admin-form">
                <input 
                    type="text" 
                    placeholder="Nombre" 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value)} 
                    required 
                />
                <input 
                    type="email" 
                    placeholder="Correo" 
                    value={correo} 
                    onChange={(e) => setCorreo(e.target.value)} 
                    required 
                    disabled={editando} 
                />
                <div className="password-input-container">
                    <input 
                        type={mostrarContraseña ? "text" : "password"}
                        placeholder="Contraseña" 
                        value={contraseña} 
                        onChange={(e) => setContraseña(e.target.value)} 
                        required={!editando} 
                    />
                    <button 
                        type="button" 
                        className="toggle-password" 
                        onClick={() => setMostrarContraseña(!mostrarContraseña)}
                    >
                        {mostrarContraseña ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                <select value={rol} onChange={(e) => setRol(e.target.value)}>
                    <option value="usuario">Usuario</option>
                    <option value="admin">Administrador</option>
                </select>
                <button type="submit">{editando ? 'Guardar Cambios' : 'Crear Usuario'}</button>
                {editando && (
                    <button 
                        type="button" 
                        onClick={() => {
                            setEditando(false);
                            setUsuarioEditado(null);
                            setNombre('');
                            setCorreo('');
                            setContraseña('');
                            setRol('usuario');
                        }}
                    >
                        Cancelar
                    </button>
                )}
            </form>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.map(usuario => (
                        <tr key={usuario._id}>
                            <td>{usuario.nombre}</td>
                            <td>{usuario.correo}</td>
                            <td>{usuario.rol}</td>
                            <td>
                                <button onClick={() => handleEdit(usuario)}>Editar</button>
                                <button onClick={() => handleDelete(usuario._id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination-controls">
    <button
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
    >
        Siguiente
    </button>
</div>


            <ToastContainer />
        </div>
    );
};

export default AdminPanel;