// src/App.js

import React, { useState } from 'react';
import './App.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/libro.css';
import './styles/autor.css';
import './styles/form.css';
import './styles/estado.css';

// Componentes de gestión
//import LibroManager from './components/libro/LibroManager';
import AutorManager from './components/autor/AutorManager';

// Componentes de autenticación
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import RecoveryForm from './components/auth/RecoveryForm';

function App() {
  const [activeTab, setActiveTab] = useState('list');
  const [user, setUser] = useState(null); // Usuario logueado
  const [authView, setAuthView] = useState('login'); // login | register | recover

  // Si no hay sesión, mostrar vistas de login/registro/recuperación
  if (!user) {
    return (
      <div className="auth-container">
        {authView === 'login' && <LoginForm onLoginSuccess={() => setUser(true)} setAuthView={setAuthView} />}
        {authView === 'register' && <RegisterForm setAuthView={setAuthView} />}
        {authView === 'recover' && <RecoveryForm setAuthView={setAuthView} />}
      </div>
    );
  }

  // Si hay sesión activa, mostrar app principal
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="library-logo">
          <div className="book-stack">
            <div className="book"></div>
            <div className="book"></div>
            <div className="book"></div>
          </div>
          <h1 className='titulo-blanco'>Biblioteca Digital</h1>
        </div>
        <button className="logout-button" onClick={() => setUser(null)}>Cerrar sesión</button>
      </header>

      <nav className="navigation-tabs">
        {/* <button className={`tab-button ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
          📚 Libros
        </button>

        <button className={`tab-button ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
          ✍️ Añadir Libro
        </button> */}

        <button className={`tab-button ${activeTab === 'autores' ? 'active' : ''}`} onClick={() => setActiveTab('autores')}>
          👤 Autores
        </button>

        <button className={`tab-button ${activeTab === 'addAutor' ? 'active' : ''}`} onClick={() => setActiveTab('addAutor')}>
          ✒️ Añadir Autor
        </button>
      </nav>

      <main className="main-content">
        {/* {['list', 'librosMySql', 'add', 'edit'].includes(activeTab) && (
          <LibroManager activeTab={activeTab} setActiveTab={setActiveTab} />
        )} */}

        {['autores', 'autoresPostgre', 'addAutor'].includes(activeTab) && (
          <AutorManager activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </main>
    </div>
  );
}

export default App;
