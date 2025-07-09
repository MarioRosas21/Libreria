import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLibroById } from '../../api/libroApi';

const LibroDetail = () => {
  const { id } = useParams();
  const [libro, setLibro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLibro = async () => {
      try {
        const data = await getLibroById(id);
        setLibro(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLibro();
  }, [id]);

  if (loading) return <div>Cargando libro...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!libro) return <div>Libro no encontrado</div>;

  return (
    <div>
      <h2>{libro.titulo}</h2>
      <p>ID: {libro.libreriaMaterialId}</p>
      <p>Fecha de Publicación: {new Date(libro.fechaPublicacion).toLocaleDateString()}</p>
      <p>ID Autor: {libro.autorLibro}</p>
      <p>New Data: {libro.newData}</p>
      <Link to="/libros">Volver a la lista</Link>
    </div>
  );
};

export default LibroDetail;