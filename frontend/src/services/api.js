import axios from 'axios';

const API_URL = 'https://metro-incidencias.onrender.com/api'; // URL del backend

export const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Interceptor para agregar el token en cada solicitud
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de respuesta para manejar la expiración del token
api.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config;

        // Si el error es por expiración del token y no se ha intentado renovar antes
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post(`${API_URL}/auth/token`, { refreshToken });

                if (response.data.token) {
                    // Guardar el nuevo token en localStorage
                    localStorage.setItem('token', response.data.token);

                    // Añadir el nuevo token a la solicitud original y reintentar
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
                    return api(originalRequest);
                }
            } catch (err) {
                console.error('No se pudo renovar el token:', err);
                // Si falla la renovación, se elimina el token de localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);
