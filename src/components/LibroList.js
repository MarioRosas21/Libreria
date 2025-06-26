import React, { useEffect, useState } from 'react';
import { getLibros } from '../api/libroApi';
import { Link } from 'react-router-dom';

const LibroList = () => {
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLibros = async () => {
      try {
        const data = await getLibros();
        setLibros(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLibros();
  }, []);

  if (loading) return <div>Cargando libros...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Lista de Libros</h2>
      <Link to="/libros/nuevo">Crear Nuevo Libro</Link>
      <ul>
        {libros.map((libro) => (
          <li key={libro.libreriaMaterialId}>
            <Link to={`/libros/${libro.libreriaMaterialId}`}>
              {libro.titulo} - Publicado: {new Date(libro.fechaPublicacion).toLocaleDateString()}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LibroList;