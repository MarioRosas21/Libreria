// src/components/libro/LibroManager.js

import React, { useState, useEffect } from 'react';
import {
  getLibros,
  createLibro,
  updateLibro,
  deleteLibro
} from '../../api/libroApi';

const AUTOR_ID_DEFAULT = '3fa85f64-5567-1021-b3fc-2c963f66afa6';

const LibroManager = ({ activeTab, setActiveTab }) => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newBook, setNewBook] = useState({ titulo: '', fechaPublicacion: '' });
  const [editingBook, setEditingBook] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [bookToDelete, setBookToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isHovering, setIsHovering] = useState(null);


  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const libros = await getLibros();
        setBooks(libros);
        setFilteredBooks(libros);
      } catch (err) {
        console.error('Error cargando libros:', err);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    const filtered = books.filter(book =>
      book.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(filtered);
  }, [searchTerm, books]);

  const validateBook = (book) => {
    const errors = {};
    if (!book.titulo?.trim()) errors.titulo = 'El título es requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    const book = {
      titulo: newBook.titulo.trim(),
      fechaPublicacion: newBook.fechaPublicacion || null,
      autorLibro: AUTOR_ID_DEFAULT
    };
    if (!validateBook(book)) return;

    try {
      const created = await createLibro(book);
      setBooks(prev => [...prev, created]);
      setNewBook({ titulo: '', fechaPublicacion: '' });
      setActiveTab('list');
    } catch (err) {
      console.error('Error creando libro:', err);
    }
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    if (!validateBook(editingBook)) return;

    try {
      await updateLibro(editingBook.libreriaMaterialId, editingBook);
      setBooks(prev =>
        prev.map(b => b.libreriaMaterialId === editingBook.libreriaMaterialId ? editingBook : b)
      );
      setEditingBook(null);
      setActiveTab('list');
    } catch (err) {
      console.error('Error actualizando libro:', err);
    }
  };

  const handleDeleteBook = async () => {
    try {
      await deleteLibro(bookToDelete);
      setBooks(prev => prev.filter(b => b.libreriaMaterialId !== bookToDelete));
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error eliminando libro:', err);
    }
  };

  const startEditing = (book) => {
    setEditingBook({
      ...book,
      fechaPublicacion: book.fechaPublicacion?.split('T')[0] || ''
    });
    setActiveTab('edit');
  };

if (activeTab === 'list') {
  return (
    <section className="books-section">
      <div className="books-header">
        <h2>Catálogo de Libros</h2>
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginTop: '10px', marginBottom: '20px', padding: '8px', width: '100%' }}
        />
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
                    onClick={() => {
                      setBookToDelete(book.libreriaMaterialId);
                      setShowDeleteModal(true);
                    }}
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

      {showDeleteModal && (
        <div className="modal">
          <p>¿Eliminar este libro?</p>
          <button onClick={handleDeleteBook}>Sí</button>
          <button onClick={() => setShowDeleteModal(false)}>No</button>
        </div>
      )}
    </section>
  );
}

if (activeTab === 'add' || activeTab === 'edit') {
  return (
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
  );
}


  return null;
};

export default LibroManager;
