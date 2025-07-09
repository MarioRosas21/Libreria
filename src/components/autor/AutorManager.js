// src/components/autor/AutorManager.js
import '../../styles/base.css';
import '../../styles/layout.css';
import '../../styles/libro.css';
import '../../styles/autor.css';
import '../../styles/form.css';
import '../../styles/estado.css';


import React, { useState, useEffect } from 'react';
import {
  getAutoresPostgre,
  createAutorPostgre,
  updateAutorPostgre,
  deleteAutorPostgre,
  searchAutoresByNombrePostgre,
  getAutorByIdPostgre
} from '../../api/autorApiPosgreSql';

const AutorManager = ({ activeTab, setActiveTab }) => {
  const [autores, setAutores] = useState([]);
  const [filteredAutores, setFilteredAutores] = useState([]);
  const [autorSearchTerm, setAutorSearchTerm] = useState('');
  const [newAutor, setNewAutor] = useState({ nombre: '', apellido: '', fechaNacimiento: '' });
  const [editingAutor, setEditingAutor] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [autorFormErrors, setAutorFormErrors] = useState({});


  useEffect(() => {
    const fetchAutores = async () => {
      try {
        const res = await getAutoresPostgre();
        setAutores(res);
        setFilteredAutores(res);
      } catch (err) {
        console.error('Error cargando autores:', err);
      }
    };
    fetchAutores();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!autorSearchTerm.trim()) return setFilteredAutores(autores);
      handleAutorSearch(autorSearchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [autorSearchTerm, autores]);

  const handleAutorSearch = async (term) => {
    try {
      if (/^[\da-fA-F-]{36}$/.test(term)) {
        const autor = await getAutorByIdPostgre(term);
        setFilteredAutores(autor ? [autor] : []);
      } else {
        const res = await searchAutoresByNombrePostgre(term);
        setFilteredAutores(res);
      }
    } catch {
      setFilteredAutores([]);
    }
  };

  const validateAutor = (autor) => {
    const errors = {};
    if (!autor.nombre?.trim()) errors.nombre = 'Nombre requerido';
    if (!autor.apellido?.trim()) errors.apellido = 'Apellido requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    const data = editingAutor || newAutor;
    if (!validateAutor(data)) return;

    try {
      if (editingAutor) {
        await updateAutorPostgre(data.autorLibroId, data);
        setAutores(prev =>
          prev.map(a => a.autorLibroId === data.autorLibroId ? data : a)
        );
      } else {
        const created = await createAutorPostgre(data);
        setAutores(prev => [...prev, created]);
      }
      setEditingAutor(null);
      setNewAutor({ nombre: '', apellido: '', fechaNacimiento: '' });
      setFilteredAutores(autores);
      setActiveTab('autores');
    } catch (err) {
      console.error('Error guardando autor:', err);
    }
  };

  const startEditing = (autor) => {
    setEditingAutor({
      ...autor,
      fechaNacimiento: autor.fechaNacimiento?.split('T')[0] || ''
    });
    setActiveTab('addAutor');
  };

  const handleDelete = async (id) => {
    try {
      await deleteAutorPostgre(id);
      setAutores(prev => prev.filter(a => a.autorLibroId !== id));
      setFilteredAutores(prev => prev.filter(a => a.autorLibroId !== id));
    } catch (err) {
      console.error('Error eliminando autor:', err);
    }
  };

if (activeTab === 'autores') {
  return (
    <section className="books-section">
      <div className="books-header">
        <h2>Lista de Autores</h2>
        <div className="search-container" style={{ marginTop: '10px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Buscar por nombre o ID..."
            value={autorSearchTerm}
            onChange={(e) => setAutorSearchTerm(e.target.value)}
            className="search-input"
          />
          <i className="search-icon">🔍</i>
          <div className="search-hint">
            Puedes buscar por nombre del autor o por su ID (GUID)
          </div>
        </div>
      </div>

      {filteredAutores.length > 0 ? (
        <div className="books-grid">
          {filteredAutores.map((autor) => (
            <div className="book-card" key={autor.autorLibroId}>
              <div className="book-cover" style={{ backgroundColor: '#4a6fa5' }}>
                <div className="book-spine"></div>
                <h3 className="book-title">{autor.nombre} {autor.apellido}</h3>
              </div>
              <div className="book-details">
                <p className="book-meta">
                  <span className="meta-label">ID:</span> {autor.autorLibroId}
                </p>
                {autor.fechaNacimiento && (
                  <p className="book-meta">
                    <span className="meta-label">Nacimiento:</span>
                    {new Date(autor.fechaNacimiento).toLocaleDateString()}
                  </p>
                )}
                <div className="book-actions">
                  <button
                    className="action-button edit"
                    onClick={() => startEditing(autor)}
                  >
                    Editar
                  </button>
                  <button
                    className="action-button delete"
                    onClick={() => handleDelete(autor.autorLibroId)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <h3>No se encontraron autores</h3>
          <p>
            {autorSearchTerm
              ? `No hay resultados para "${autorSearchTerm}"`
              : 'La lista de autores está vacía. ¡Añade tu primer autor!'}
          </p>
          {!autorSearchTerm && (
            <button
              className="add-first-book"
              onClick={() => {
                setEditingAutor(null);
                setNewAutor({ nombre: '', apellido: '', fechaNacimiento: '' });
                setActiveTab('addAutor');
              }}
            >
              Añadir Primer Autor
            </button>
          )}
        </div>
      )}
    </section>
  );
}

if (activeTab === 'addAutor') {
  return (
    <section className="form-section">
      <h2>{editingAutor ? 'Editar Autor Existente' : 'Añadir Nuevo Autor'}</h2>
      <form onSubmit={handleAddOrUpdate}>
        <div className="form-group">
          <label className="floating-label">
            <input
              type="text"
              value={editingAutor?.nombre || newAutor.nombre}
              onChange={(e) => editingAutor
                ? setEditingAutor({ ...editingAutor, nombre: e.target.value })
                : setNewAutor({ ...newAutor, nombre: e.target.value })}
              className={`floating-input ${autorFormErrors.nombre ? 'input-error' : ''}`}
              placeholder=" "
              required
            />
            <span className="floating-text">Nombre *</span>
          </label>
          {autorFormErrors.nombre && <span className="error-message">{autorFormErrors.nombre}</span>}
        </div>

        <div className="form-group">
          <label className="floating-label">
            <input
              type="text"
              value={editingAutor?.apellido || newAutor.apellido}
              onChange={(e) => editingAutor
                ? setEditingAutor({ ...editingAutor, apellido: e.target.value })
                : setNewAutor({ ...newAutor, apellido: e.target.value })}
              className={`floating-input ${autorFormErrors.apellido ? 'input-error' : ''}`}
              placeholder=" "
              required
            />
            <span className="floating-text">Apellido *</span>
          </label>
          {autorFormErrors.apellido && <span className="error-message">{autorFormErrors.apellido}</span>}
        </div>

        <div className="form-group">
          <label className="floating-label">
            <input
              type="date"
              value={editingAutor?.fechaNacimiento || newAutor.fechaNacimiento}
              onChange={(e) => editingAutor
                ? setEditingAutor({ ...editingAutor, fechaNacimiento: e.target.value })
                : setNewAutor({ ...newAutor, fechaNacimiento: e.target.value })}
              className={`floating-input ${autorFormErrors.fechaNacimiento ? 'input-error' : ''}`}
              placeholder=" "
            />
            <span className="floating-text">Fecha de Nacimiento</span>
          </label>
          {autorFormErrors.fechaNacimiento && <span className="error-message">{autorFormErrors.fechaNacimiento}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            {editingAutor ? 'Actualizar Autor' : 'Guardar Autor'}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => {
              setEditingAutor(null);
              setActiveTab('autores');
              setNewAutor({ nombre: '', apellido: '', fechaNacimiento: '' });
              setAutorFormErrors({ nombre: '', apellido: '', fechaNacimiento: '' });
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}


  return null;
};

export default AutorManager;
