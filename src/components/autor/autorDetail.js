import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAutorById } from '../../api/autorApi';

const AutorDetail = () => {
  const { id } = useParams();
  const [autor, setAutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAutor = async () => {
      try {
        const data = await getAutorById(id);
        setAutor(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAutor();
  }, [id]);

  if (loading) return <div>Cargando autor...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!autor) return <div>Autor no encontrado</div>;

  return (
    <div>
      <h2>{autor.nombre} {autor.apellido}</h2>
      <p>ID: {autor.autorLibroId}</p>
      <p>Fecha de nacimiento: {new Date(autor.fechaNacimiento).toLocaleDateString()}</p>
      <Link to="/autores">Volver a la lista</Link>
    </div>
  );
};

export default AutorDetail;
