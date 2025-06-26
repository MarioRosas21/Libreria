// src/components/AutorList.js
import React, { useEffect, useState } from 'react';
import { getAutores } from '../api/autorApi';

const AutorList = () => {
  const [autores, setAutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAutores = async () => {
      try {
        const data = await getAutores();
        setAutores(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAutores();
  }, []);

  if (loading) return <div>Cargando autores...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Lista de Autores</h2>
      <ul>
        {autores.map((autor) => (
          <li key={autor.autorLibroId}>
            {autor.nombre} {autor.apellido} - Nacido:{" "}
            {new Date(autor.fechaNacimiento).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AutorList;
