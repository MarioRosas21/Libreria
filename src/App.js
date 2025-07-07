import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  getAutoresPostgre, 
  createAutorPostgre, 
  deleteAutorPostgre, 
  updateAutorPostgre, 
  searchAutoresByNombrePostgre, 
  getAutorByIdPostgre 
} from './api/autorApiPosgreSql';

function App() {
  // Estados para autores
  const [autores, setAutores] = useState([]);
  const [filteredAutores, setFilteredAutores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newAutor, setNewAutor] = useState({
    nombre: '',
    apellido: '',
    fechaNacimiento: ''
  });
  const [editingAutor, setEditingAutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [formErrors, setFormErrors] = useState({
    nombre: '',
    apellido: '',
    fechaNacimiento: ''
  });
  const [autorToDelete, setAutorToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formatAutorData = (autor) => ({
    autorLibroId: autor.autorLibroId || autor.id || `temp-${Date.now()}`,
    nombre: autor.nombre || 'Sin nombre',
    apellido: autor.apellido || 'Sin apellido',
    fechaNacimiento: autor.fechaNacimiento || null
  });

  const validateAutorForm = (autorData) => {
    const errors = {};
    let isValid = true;

    if (!autorData.nombre.trim()) {
      errors.nombre = 'Nombre es requerido';
      isValid = false;
    }

    if (!autorData.apellido.trim()) {
      errors.apellido = 'Apellido es requerido';
      isValid = false;
    }

    if (autorData.fechaNacimiento) {
      const inputDate = new Date(autorData.fechaNacimiento);
      const currentDate = new Date();
      
      if (inputDate > currentDate) {
        errors.fechaNacimiento = 'La fecha no puede ser futura';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleApiError = (err) => {
    if (err.response) {
      switch (err.response.status) {
        case 400:
          setError('Datos inválidos enviados al servidor');
          break;
        case 404:
          setError('Recurso no encontrado');
          break;
        case 500:
          setError('Error interno del servidor');
          break;
        default:
          setError(`Error: ${err.message}`);
      }
    } else if (err.request) {
      setError('No se recibió respuesta del servidor');
    } else {
      setError(`Error de configuración: ${err.message}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const autoresData = await getAutoresPostgre();
        setAutores(autoresData.map(formatAutorData));
        setFilteredAutores(autoresData.map(formatAutorData));
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setFilteredAutores(autores);
      } else {
        handleAutorSearch(searchTerm);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, autores]);

  const handleAutorSearch = async (searchTerm) => {
    try {
      setLoading(true);
      
      // Primero intentamos buscar por ID (GUID)
      if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(searchTerm)) {
        try {
          const autor = await getAutorByIdPostgre(searchTerm);
          setFilteredAutores(autor ? [formatAutorData(autor)] : []);
        } catch (error) {
          // Si falla la búsqueda por ID, intentamos por nombre
          const resultados = await searchAutoresByNombrePostgre(searchTerm);
          setFilteredAutores(resultados.map(formatAutorData));
        }
      } else {
        // Búsqueda por nombre
        const resultados = await searchAutoresByNombrePostgre(searchTerm);
        setFilteredAutores(resultados.map(formatAutorData));
      }
    } catch (err) {
      handleApiError(err);
      setFilteredAutores(autores);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAutor = async (e) => {
    e.preventDefault();
    if (!validateAutorForm(newAutor)) return;

    const autorData = {
      nombre: newAutor.nombre.trim(),
      apellido: newAutor.apellido.trim(),
      fechaNacimiento: newAutor.fechaNacimiento || null
    };

    try {
      const created = await createAutorPostgre(autorData);
      setAutores(prev => [...prev, formatAutorData(created)]);
      setFilteredAutores(prev => [...prev, formatAutorData(created)]);
      setNewAutor({ nombre: '', apellido: '', fechaNacimiento: '' });
      setActiveTab('list');
    } catch (err) {
      console.error("Error al crear autor:", err);
      handleApiError(err);
    }
  };

  const handleUpdateAutor = async (e) => {
    e.preventDefault();
    
    if (!validateAutorForm(editingAutor)) return;

    try {
      const updatedAutor = await updateAutorPostgre(editingAutor.autorLibroId, editingAutor);
      setAutores(prev => prev.map(a => 
        a.autorLibroId === updatedAutor.autorLibroId ? formatAutorData(updatedAutor) : a
      ));
      setFilteredAutores(prev => prev.map(a => 
        a.autorLibroId === updatedAutor.autorLibroId ? formatAutorData(updatedAutor) : a
      ));
      setEditingAutor(null);
      setActiveTab('list');
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleDeleteAutor = async (id) => {
    if (!id) return;
    setAutorToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteAutor = async () => {
    try {
      await deleteAutorPostgre(autorToDelete);
      setAutores(prev => prev.filter(a => a.autorLibroId !== autorToDelete));
      setFilteredAutores(prev => prev.filter(a => a.autorLibroId !== autorToDelete));
      setShowDeleteModal(false);
    } catch (err) {
      try {
        const autoresData = await getAutoresPostgre();
        setAutores(autoresData.map(formatAutorData));
        setFilteredAutores(autoresData.map(formatAutorData));
      } catch (fetchError) {
        setError('Error al recuperar los autores después de un fallo en la eliminación');
      }
      handleApiError(err);
    }
  };

  const startEditingAutor = (autor) => {
    setEditingAutor({
      ...autor,
      fechaNacimiento: autor.fechaNacimiento?.split('T')[0] || ''
    });
    setActiveTab('edit');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="book-loader">
        <div className="book">
          <div className="page"></div>
          <div className="page"></div>
          <div className="page"></div>
        </div>
        <p>Cargando autores...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="error-screen">
      <div className="error-message">
        <h2>¡Error!</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que quieres eliminar este autor?</p>
            <div className="modal-actions">
              <button 
                className="modal-button confirm"
                onClick={confirmDeleteAutor}
              >
                Eliminar
              </button>
              <button 
                className="modal-button cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="app-header">
        <div className="library-logo">
          <div className="book-stack">
            <div className="book"></div>
            <div className="book"></div>
            <div className="book"></div>
          </div>
          <h1 className='titulo-blanco'>Gestión de Autores (PostgreSQL)</h1>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar autores por nombre o ID..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <i className="search-icon">🔍</i>
        </div>
      </header>

      <main className="main-content">
        <nav className="navigation-tabs">
          <button 
            className={`tab-button ${activeTab === 'list' ? 'active' : ''}`} 
            onClick={() => setActiveTab('list')}
          >
            <i className="tab-icon">📚</i> Lista de Autores
          </button>
          <button 
            className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => {
              setEditingAutor(null);
              setNewAutor({ nombre: '', apellido: '', fechaNacimiento: '' });
              setFormErrors({ nombre: '', apellido: '', fechaNacimiento: '' });
              setActiveTab('add');
            }}
          >
            <i className="tab-icon">✒️</i> Añadir Autor
          </button>
        </nav>

        {activeTab === 'list' && (
          <section className="books-section">
            <div className="books-header">
              <h2>Lista de Autores</h2>
              <div className="search-hint">
                {searchTerm 
                  ? `Buscando: "${searchTerm}"` 
                  : 'Puedes buscar por nombre del autor o por su ID'}
              </div>
            </div>

            {filteredAutores.length > 0 ? (
              <div className="books-grid">
                {filteredAutores.map((autor) => (
                  <div className="book-card" key={autor.autorLibroId}>
                    <div className="book-cover" style={{backgroundColor: '#4a6fa5'}}>
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
                          onClick={() => startEditingAutor(autor)}
                        >
                          Editar
                        </button>
                        <button 
                          className="action-button delete"
                          onClick={() => handleDeleteAutor(autor.autorLibroId)}
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
                  {searchTerm 
                    ? `No hay resultados para "${searchTerm}"` 
                    : 'La lista de autores está vacía. ¡Añade tu primer autor!'}
                </p>
                {!searchTerm && (
                  <button 
                    className="add-first-book"
                    onClick={() => {
                      setEditingAutor(null);
                      setNewAutor({ nombre: '', apellido: '', fechaNacimiento: '' });
                      setActiveTab('add');
                    }}
                  >
                    Añadir Primer Autor
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {(activeTab === 'add' || activeTab === 'edit') && (
          <section className="form-section">
            <h2>{editingAutor ? 'Editar Autor Existente' : 'Añadir Nuevo Autor'}</h2>
            <form onSubmit={editingAutor ? handleUpdateAutor : handleAddAutor}>
              <div className="form-group">
                <label className="floating-label">
                  <input
                    type="text"
                    value={editingAutor?.nombre || newAutor.nombre}
                    onChange={(e) => editingAutor
                      ? setEditingAutor({...editingAutor, nombre: e.target.value})
                      : setNewAutor({...newAutor, nombre: e.target.value})}
                    className={`floating-input ${formErrors.nombre ? 'input-error' : ''}`}
                    placeholder=" "
                    required
                  />
                  <span className="floating-text">Nombre *</span>
                </label>
                {formErrors.nombre && <span className="error-message">{formErrors.nombre}</span>}
              </div>

              <div className="form-group">
                <label className="floating-label">
                  <input
                    type="text"
                    value={editingAutor?.apellido || newAutor.apellido}
                    onChange={(e) => editingAutor
                      ? setEditingAutor({...editingAutor, apellido: e.target.value})
                      : setNewAutor({...newAutor, apellido: e.target.value})}
                    className={`floating-input ${formErrors.apellido ? 'input-error' : ''}`}
                    placeholder=" "
                    required
                  />
                  <span className="floating-text">Apellido *</span>
                </label>
                {formErrors.apellido && <span className="error-message">{formErrors.apellido}</span>}
              </div>

              <div className="form-group">
                <label className="floating-label">
                  <input
                    type="date"
                    value={editingAutor?.fechaNacimiento || newAutor.fechaNacimiento}
                    onChange={(e) => editingAutor
                      ? setEditingAutor({...editingAutor, fechaNacimiento: e.target.value})
                      : setNewAutor({...newAutor, fechaNacimiento: e.target.value})}
                    className={`floating-input ${formErrors.fechaNacimiento ? 'input-error' : ''}`}
                    placeholder=" "
                  />
                  <span className="floating-text">Fecha de Nacimiento</span>
                </label>
                {formErrors.fechaNacimiento && <span className="error-message">{formErrors.fechaNacimiento}</span>}
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
                    setActiveTab('list');
                    setNewAutor({ nombre: '', apellido: '', fechaNacimiento: '' });
                    setFormErrors({ nombre: '', apellido: '', fechaNacimiento: '' });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;