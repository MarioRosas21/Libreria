import React, { useState, useEffect } from 'react';
import './App.css';
import { getLibros, createLibro, deleteLibro, updateLibro } from './api/libroApi';
import { getAutores, createAutor, deleteAutor, updateAutor, searchAutoresByNombre } from './api/autorApi';

function App() {
  // Estados para libros
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newBook, setNewBook] = useState({ 
    titulo: '', 
    fechaPublicacion: '',
    autorLibro: ''
  });
  const [editingBook, setEditingBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [isHovering, setIsHovering] = useState(null);
  const [formErrors, setFormErrors] = useState({
    titulo: '',
    fechaPublicacion: '',
    autorLibro: ''
  });
  const [bookToDelete, setBookToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estados para autores
  const [autores, setAutores] = useState([]);
  const [filteredAutores, setFilteredAutores] = useState([]);
  const [autorSearchTerm, setAutorSearchTerm] = useState('');
  const [newAutor, setNewAutor] = useState({
    nombre: '',
    apellido: '',
    fechaNacimiento: ''
  });
  const [editingAutor, setEditingAutor] = useState(null);
  const [autorFormErrors, setAutorFormErrors] = useState({
    nombre: '',
    apellido: ''
  });
  const [autorToDelete, setAutorToDelete] = useState(null);
  const [showDeleteAutorModal, setShowDeleteAutorModal] = useState(false);

  const formatBookData = (book) => {
    try {
      return {
        libreriaMaterialId: book.libreriaMaterialId || `temp-${Date.now()}`,
        titulo: book.titulo || book.Titulo || 'Sin título',
        fechaPublicacion: book.fechaPublicacion || book.FechaPublicacion || null,
        autorLibro: book.autorLibro || book.AutorLibro || null
      };
    } catch (error) {
      console.error('Error formateando datos del libro:', error);
      return {
        libreriaMaterialId: `error-${Date.now()}`,
        titulo: 'Error cargando título',
        fechaPublicacion: null,
        autorLibro: null
      };
    }
  };

  const formatAutorData = (autor) => ({
    autorLibroId: autor.autorLibroId || autor.id || `temp-${Date.now()}`,
    nombre: autor.nombre || 'Sin nombre',
    apellido: autor.apellido || 'Sin apellido',
    fechaNacimiento: autor.fechaNacimiento || null
  });

  const validateBookForm = (bookData) => {
    const errors = {};
    let isValid = true;

    if (!bookData.titulo.trim()) {
      errors.titulo = 'El título es requerido';
      isValid = false;
    } else if (bookData.titulo.length > 100) {
      errors.titulo = 'El título no puede exceder 100 caracteres';
      isValid = false;
    }

    if (bookData.fechaPublicacion) {
      const inputDate = new Date(bookData.fechaPublicacion);
      const currentDate = new Date();
      
      if (inputDate > currentDate) {
        errors.fechaPublicacion = 'La fecha no puede ser futura';
        isValid = false;
      } else if (inputDate.getFullYear() < 1000) {
        errors.fechaPublicacion = 'Fecha inválida';
        isValid = false;
      }
    }

    if (bookData.autorLibro && !/^[a-zA-Z0-9-]+$/.test(bookData.autorLibro)) {
      errors.autorLibro = 'ID Autor solo puede contener letras, números y guiones';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

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

    setAutorFormErrors(errors);
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
        const [librosData, autoresData] = await Promise.all([
          getLibros(),
          getAutores()
        ]);
        setBooks(librosData.map(formatBookData));
        setFilteredBooks(librosData.map(formatBookData));
        setAutores(autoresData);
        setFilteredAutores(autoresData);
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = books.filter(book =>
      book.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(filtered);
  }, [searchTerm, books]);

  const handleAutorSearch = async (searchTerm) => {
    try {
      setLoading(true);
      const resultados = await searchAutoresByNombre(searchTerm);
      setFilteredAutores(resultados.map(formatAutorData));
    } catch (err) {
      handleApiError(err);
      setFilteredAutores(autores);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (autorSearchTerm.trim() === '') {
        setFilteredAutores(autores);
      } else {
        handleAutorSearch(autorSearchTerm);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [autorSearchTerm, autores]);

  const handleAddBook = async (e) => {
    e.preventDefault();
    
    if (!validateBookForm(newBook)) return;

    try {
      const bookToSend = {
        titulo: newBook.titulo.trim(),
        fechaPublicacion: newBook.fechaPublicacion || null,
        autorLibro: newBook.autorLibro || null
      };

      const tempBook = formatBookData({
        ...bookToSend,
        libreriaMaterialId: `temp-${Date.now()}`
      });
      
      setBooks(prev => [...prev, tempBook]);
      
      const createdBook = await createLibro(bookToSend);
      
      setBooks(prev => prev.map(b => 
        b.libreriaMaterialId === tempBook.libreriaMaterialId 
          ? formatBookData(createdBook) 
          : b
      ));
      
      setNewBook({ titulo: '', fechaPublicacion: '', autorLibro: '' });
      setFormErrors({ titulo: '', fechaPublicacion: '', autorLibro: '' });
      setActiveTab('list');
    } catch (err) {
      setBooks(prev => prev.filter(b => !b.libreriaMaterialId.includes('temp-')));
      handleApiError(err);
    }
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    
    if (!validateBookForm(editingBook)) return;

    try {
      const bookToSend = {
        titulo: editingBook.titulo.trim(),
        fechaPublicacion: editingBook.fechaPublicacion || null,
        autorLibro: editingBook.autorLibro || null,
        libreriaMaterialId: editingBook.libreriaMaterialId
      };

      setBooks(prev => prev.map(b => 
        b.libreriaMaterialId === bookToSend.libreriaMaterialId
          ? { ...b, ...bookToSend }
          : b
      ));
      
      const updatedBook = await updateLibro(bookToSend.libreriaMaterialId, bookToSend);
      
      setBooks(prev => prev.map(b => 
        b.libreriaMaterialId === bookToSend.libreriaMaterialId
          ? formatBookData(updatedBook)
          : b
      ));
      
      setEditingBook(null);
      setFormErrors({ titulo: '', fechaPublicacion: '', autorLibro: '' });
      setActiveTab('list');
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!id) return;
    setBookToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteBook = async () => {
    try {
      setBooks(prev => prev.filter(b => b.libreriaMaterialId !== bookToDelete));
      await deleteLibro(bookToDelete);
      setShowDeleteModal(false);
    } catch (err) {
      try {
        const libros = await getLibros();
        setBooks(libros.map(formatBookData));
      } catch (fetchError) {
        setError('Error al recuperar los libros después de un fallo en la eliminación');
      }
      handleApiError(err);
    }
  };

  const handleAddAutor = async (e) => {
    e.preventDefault();
    
    if (!validateAutorForm(newAutor)) return;

    try {
      const autorToSend = {
        nombre: newAutor.nombre.trim(),
        apellido: newAutor.apellido.trim(),
        fechaNacimiento: newAutor.fechaNacimiento || null
      };

      const tempAutor = formatAutorData({
        ...autorToSend,
        autorLibroId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      });
      
      setAutores(prev => [...prev, tempAutor]);
      
      const createdAutor = await createAutor(autorToSend);
      
      setAutores(prev => prev.map(a => 
        a.autorLibroId === tempAutor.autorLibroId ? formatAutorData(createdAutor) : a
      ));
      
      setNewAutor({ nombre: '', apellido: '', fechaNacimiento: '' });
      setActiveTab('autores');
    } catch (err) {
      setAutores(prev => prev.filter(a => !a.autorLibroId.includes('temp-')));
      handleApiError(err);
    }
  };

  const handleUpdateAutor = async (e) => {
    e.preventDefault();
    
    if (!validateAutorForm(editingAutor)) return;

    try {
      const updatedAutor = await updateAutor(editingAutor.autorLibroId, editingAutor);
      setAutores(prev => prev.map(a => 
        a.autorLibroId === updatedAutor.autorLibroId ? updatedAutor : a
      ));
      setEditingAutor(null);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleDeleteAutor = async (id) => {
    if (!id) return;
    setAutorToDelete(id);
    setShowDeleteAutorModal(true);
  };

  const confirmDeleteAutor = async () => {
    try {
      setAutores(prev => prev.filter(a => a.autorLibroId !== autorToDelete));
      await deleteAutor(autorToDelete);
      setShowDeleteAutorModal(false);
    } catch (err) {
      try {
        const autoresData = await getAutores();
        setAutores(autoresData);
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
  };

  const startEditing = (book) => {
    setEditingBook({
      ...book,
      fechaPublicacion: book.fechaPublicacion?.split('T')[0] || ''
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
        <p>Cargando tu biblioteca...</p>
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
            <p>¿Estás seguro de que quieres eliminar este libro?</p>
            <div className="modal-actions">
              <button 
                className="modal-button confirm"
                onClick={confirmDeleteBook}
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

      {showDeleteAutorModal && (
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
                onClick={() => setShowDeleteAutorModal(false)}
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
          <h1 className='titulo-blanco'>Biblioteca Digital</h1>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar libros..."
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
            <i className="tab-icon">📚</i>Libros
          </button>
          <button 
            className={`tab-button ${activeTab === 'autores' ? 'active' : ''}`}
            onClick={() => setActiveTab('autores')}
          >
            <i className="tab-icon">👤</i> Autores
          </button>
          <button 
            className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => {
              setEditingBook(null);
              setActiveTab('add');
            }}
          >
            <i className="tab-icon">✍️</i> Añadir Libro
          </button>
          <button 
            className={`tab-button ${activeTab === 'addAutor' ? 'active' : ''}`}
            onClick={() => {
              setEditingAutor(null);
              setNewAutor({ nombre: '', apellido: '', fechaNacimiento: '' });
              setAutorFormErrors({ nombre: '', apellido: '', fechaNacimiento: '' });
              setActiveTab('addAutor');
            }}
          >
            <i className="tab-icon">✒️</i> Añadir Autor
          </button>
        </nav>

        {activeTab === 'list' && (
          <section className="books-section">
            <div className="books-header">
              <h2>Catálogo de Libros</h2>
              <p className="books-count">
                {searchTerm 
                  ? `${filteredBooks.length} resultados para "${searchTerm}"` 
                  : `${books.length} libros en total`}
              </p>
            </div>
            
            {filteredBooks.length > 0 ? (
              <div className="books-grid">
                {filteredBooks.map((book) => (
                  <div 
                    className={`book-card ${isHovering === book.libreriaMaterialId ? 'hovered' : ''}`}
                    key={book.libreriaMaterialId}
                    onMouseEnter={() => setIsHovering(book.libreriaMaterialId)}
                    onMouseLeave={() => setIsHovering(null)}
                  >
                    <div className="book-cover">
                      <div className="book-spine"></div>
                      <h3 className="book-title">{book.titulo}</h3>
                    </div>
                    <div className="book-details">
                      <p className="book-meta">
                        <span className="meta-label">Publicación:</span> 
                        {book.fechaPublicacion 
                          ? new Date(book.fechaPublicacion).toLocaleDateString() 
                          : 'No especificada'}
                      </p>
                      <p className="book-meta">
                        <span className="meta-label">Autor ID:</span> 
                        {book.autorLibro || 'No especificado'}
                      </p>
                      <div className="book-actions">
                        <button 
                          className="action-button edit"
                          onClick={() => startEditing(book)}
                        >
                          Editar
                        </button>
                        <button 
                          className="action-button delete"
                          onClick={() => handleDeleteBook(book.libreriaMaterialId)}
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
                <div className="empty-icon">📖</div>
                <h3>No se encontraron libros</h3>
                <p>{searchTerm 
                  ? `No hay resultados para "${searchTerm}"` 
                  : 'La biblioteca está vacía. ¡Añade tu primer libro!'}</p>
                {!searchTerm && (
                  <button 
                    className="add-first-book"
                    onClick={() => setActiveTab('add')}
                  >
                    Añadir Primer Libro
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === 'autores' && (
          <section className="books-section">
            <div className="books-header">
              <h2>Lista de Autores</h2>
              <div className="search-container" style={{marginTop: '10px'}}>
                <input
                  type="text"
                  placeholder="Buscar autores por nombre..."
                  value={autorSearchTerm}
                  onChange={(e) => setAutorSearchTerm(e.target.value)}
                  className="search-input"
                />
                <i className="search-icon">🔍</i>
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
        )}

        {(activeTab === 'add' || activeTab === 'edit') && (
          <section className="form-section">
            <h2>{editingBook ? 'Editar Libro Existente' : 'Añadir Nuevo Libro'}</h2>
            <form onSubmit={editingBook ? handleUpdateBook : handleAddBook}>
              <div className="form-group">
                <label className="floating-label">
                  <input
                    type="text"
                    value={editingBook?.titulo || newBook.titulo}
                    onChange={(e) => editingBook
                      ? setEditingBook({...editingBook, titulo: e.target.value})
                      : setNewBook({...newBook, titulo: e.target.value})}
                    className={`floating-input ${formErrors.titulo ? 'input-error' : ''}`}
                    placeholder=" "
                    required
                  />
                  <span className="floating-text">Título del Libro *</span>
                </label>
                {formErrors.titulo && <span className="error-message">{formErrors.titulo}</span>}
              </div>
              
              <div className="form-group">
                <label className="floating-label">
                  <input
                    type="date"
                    value={editingBook?.fechaPublicacion || newBook.fechaPublicacion}
                    onChange={(e) => editingBook
                      ? setEditingBook({...editingBook, fechaPublicacion: e.target.value})
                      : setNewBook({...newBook, fechaPublicacion: e.target.value})}
                    className={`floating-input ${formErrors.fechaPublicacion ? 'input-error' : ''}`}
                    placeholder=" "
                  />
                  <span className="floating-text">Fecha de Publicación</span>
                </label>
                {formErrors.fechaPublicacion && <span className="error-message">{formErrors.fechaPublicacion}</span>}
              </div>
              
              <div className="form-group">
                <label className="floating-label">
                  <input
                    type="text"
                    value={editingBook?.autorLibro || newBook.autorLibro || ''}
                    onChange={(e) => {
                      const value = e.target.value || null;
                      editingBook
                        ? setEditingBook({...editingBook, autorLibro: value})
                        : setNewBook({...newBook, autorLibro: value});
                    }}
                    className={`floating-input ${formErrors.autorLibro ? 'input-error' : ''}`}
                    placeholder=" "
                  />
                  <span className="floating-text">ID Autor</span>
                </label>
                {formErrors.autorLibro && <span className="error-message">{formErrors.autorLibro}</span>}
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {editingBook ? 'Actualizar Libro' : 'Guardar Libro'}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setEditingBook(null);
                    setActiveTab('list');
                    setFormErrors({ titulo: '', fechaPublicacion: '', autorLibro: '' });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'addAutor' && (
          <section className="form-section">
            <h2>Añadir Nuevo Autor</h2>
            <form onSubmit={handleAddAutor}>
              <div className="form-group">
                <label className="floating-label">
                  <input
                    type="text"
                    value={newAutor.nombre}
                    onChange={(e) => setNewAutor({ ...newAutor, nombre: e.target.value })}
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
                    value={newAutor.apellido}
                    onChange={(e) => setNewAutor({ ...newAutor, apellido: e.target.value })}
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
                    value={newAutor.fechaNacimiento}
                    onChange={(e) => setNewAutor({ ...newAutor, fechaNacimiento: e.target.value })}
                    className={`floating-input ${autorFormErrors.fechaNacimiento ? 'input-error' : ''}`}
                    placeholder=" "
                  />
                  <span className="floating-text">Fecha de Nacimiento</span>
                </label>
                {autorFormErrors.fechaNacimiento && <span className="error-message">{autorFormErrors.fechaNacimiento}</span>}
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Guardar Autor
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
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
        )}
      </main>
    </div>
  );
}

export default App;