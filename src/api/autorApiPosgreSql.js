// src/api/autorApi.js
import axios from 'axios';

const api = axios.create({
  //baseURL: 'https://microservicioautorlibro.somee.com/api/autor', // Asegúrate que esta URL sea accesible desde el frontend
  baseURL: 'https://microservicioautorposgre.onrender.com/api/autor',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar expiración del token
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Si el token expiró y no hemos reintentado ya
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        console.warn("No hay refresh token, redirigiendo al login");
        window.location.reload(); // O redirige a login
        return Promise.reject(error);
      }

      try {
        const response = await axios.post('https://microserviciologin.onrender.com/api/auth/refresh', {
          refreshToken,
        });

        const newToken = response.data.token;
        localStorage.setItem('token', newToken);

        // Actualizar token en la cabecera y reintentar original request
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        return api(originalRequest);

      } catch (refreshError) {
        console.error("Fallo al refrescar token:", refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.reload(); // Cierra sesión si falla el refresh
      }
    }

    return Promise.reject(error);
  }
);

// Interceptor para agregar el token antes de cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // recupera el token del localStorage
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Obtener todos los autores
export const getAutoresPostgre = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching autores:', error);
    throw error;
  }
};

// Obtener autor por ID
export const getAutorByIdPostgre = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching autor ${id}:`, error);
    throw error;
  }
};

// Crear un nuevo autor
export const createAutorPostgre = async (autorData) => {
  try {
    const response = await api.post('/', {
      Nombre: autorData.nombre,
      Apellido: autorData.apellido,
      FechaNacimiento: autorData.fechaNacimiento || null,
    });

    return response.data;
  } catch (error) {
    console.error('Error creating autor:', error);
    throw error;
  }
};


export const updateAutorPostgre = async (id, autorData) => {
  const response = await api.put(`/${id}`, {
    Nombre: autorData.nombre,
    Apellido: autorData.apellido,
    FechaNacimiento: autorData.fechaNacimiento || null,
  });
  return response.data;
};

export const deleteAutorPostgre = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

// Buscar autores por nombre (parcial)
export const searchAutoresByNombrePostgre = async (nombre) => {
  try {
    const response = await api.get(`/buscar?nombre=${encodeURIComponent(nombre)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching autores:', error);
    throw error;
  }
};