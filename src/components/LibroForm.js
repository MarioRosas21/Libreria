import React, { useState } from 'react';
import { createLibro } from '../api/libroApi';
import { useNavigate } from 'react-router-dom';

const LibroForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    fechaPublicacion: '',
    autorLibro: '',
    newData: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createLibro(formData);
      navigate('/libros');
    } catch (error) {
      console.error('Error al crear libro:', error);
    }
  };

  return (
    <div>
      <h2>Nuevo Libro</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Título:</label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Fecha de Publicación:</label>
          <input
            type="date"
            name="fechaPublicacion"
            value={formData.fechaPublicacion}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>ID Autor:</label>
          <input
            type="text"
            name="autorLibro"
            value={formData.autorLibro}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>New Data:</label>
          <input
            type="number"
            name="newData"
            value={formData.newData}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
};

export default LibroForm;