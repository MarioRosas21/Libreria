// src/components/AsignarAutorModal.js
import React, { useState, useEffect } from 'react';
import { getAutores } from '../../api/autorApi';

function AsignarAutorModal({ libroId, onAsignar, onClose }) {
  const [autores, setAutores] = useState([]);
  const [autorSeleccionado, setAutorSeleccionado] = useState('');

  useEffect(() => {
    async function cargarAutores() {
      const response = await getAutores();
      setAutores(response.data);
    }
    cargarAutores();
  }, []);

  const handleAsignar = () => {
    if (autorSeleccionado) {
      onAsignar(libroId, autorSeleccionado);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Asignar Autor al Libro</h3>
        
        <select
          value={autorSeleccionado}
          onChange={(e) => setAutorSeleccionado(e.target.value)}
          className="autor-select"
        >
          <option value="">Seleccione un autor</option>
          {autores.map(autor => (
            <option key={autor.AutorLibroId} value={autor.AutorLibroId}>
              {autor.Nombre} {autor.Apellido}
            </option>
          ))}
        </select>
        
        <div className="modal-actions">
          <button onClick={handleAsignar} disabled={!autorSeleccionado}>
            Asignar
          </button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default AsignarAutorModal;