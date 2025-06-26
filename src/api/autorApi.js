// src/api/autorApi.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://microservicioautor.onrender.com/api/autor', // Asegúrate que esta URL sea accesible desde el frontend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Obtener todos los autores
export const getAutores = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching autores:', error);
    throw error;
  }
};

// Obtener autor por ID
export const getAutorById = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching autor ${id}:`, error);
    throw error;
  }
};

// Crear un nuevo autor
export const createAutor = async (autorData) => {
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


export const updateAutor = async (id, autorData) => {
  const response = await api.put(`/${id}`, {
    Nombre: autorData.nombre,
    Apellido: autorData.apellido,
    FechaNacimiento: autorData.fechaNacimiento || null,
  });
  return response.data;
};

export const deleteAutor = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

// Buscar autores por nombre (parcial)
export const searchAutoresByNombre = async (nombre) => {
  try {
    const response = await api.get(`/buscar?nombre=${encodeURIComponent(nombre)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching autores:', error);
    throw error;
  }
};