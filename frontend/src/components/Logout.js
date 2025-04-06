import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Logout = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();

    useEffect(() => {
        toast.success("Sesión cerrada con éxito ✅", { autoClose: 3000 });

        setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");

            if (setIsAuthenticated) setIsAuthenticated(false); 
            
            navigate("/"); 
        }, 3000); // Espera 3 segundos antes de redirigir
    }, [navigate, setIsAuthenticated]);

    return (
        <div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default Logout;
