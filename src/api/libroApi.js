import axios from 'axios';

const api = axios.create({
  //baseURL: 'https://microserviciolibro.onrender.com/api/LibroMaterial', //configurado con un loud balancer por eso puerto 8080
  baseURL: 'https://localhost:32771/api/LibroMaterial',

  //http://localhost:8080/api/LibroMaterial/instancia
  
  headers: {
    'Content-Type': 'application/json',
  },
});

// Obtener todos los libros
export const getLibros = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching libros:', error);
    throw error;
  }
};

// Obtener un libro por ID
export const getLibroById = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching libro ${id}:`, error);
    throw error;
  }
};

// Crear un nuevo libro
export const createLibro = async (libroData) => {
  try {
    const response = await api.post('/', {
      Titulo: libroData.titulo,
      FechaPublicacion: libroData.fechaPublicacion || null,
      AutorLibro: libroData.autorLibro || null
    });
    
    // Asegurar que la respuesta tenga el formato correcto
    return {
      libreriaMaterialId: response.data.libreriaMaterialId || response.data.id,
      titulo: libroData.titulo, // Usamos los datos que enviamos si el backend no los devuelve
      fechaPublicacion: libroData.fechaPublicacion,
      autorLibro: libroData.autorLibro
    };
  } catch (error) {
    console.error('Error creating libro:', error);
    throw error;
  }
};

// Actualizar un libro
export const updateLibro = async (id, libroData) => {
  try {
    const response = await api.put(`/${id}`, {
      Titulo: libroData.titulo,
      FechaPublicacion: libroData.fechaPublicacion || null,
      AutorLibro: libroData.autorLibro || null,
      LibroId: id // Asegurarnos de incluir el ID en el cuerpo si el backend lo requiere
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating libro ${id}:`, error);
    throw error;
  }
};

// Eliminar un libro
export const deleteLibro = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting libro ${id}:`, error);
    throw error;
  }
};