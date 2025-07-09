// src/components/auth/LoginForm.js

import React, { useState } from 'react';
import { loginUser } from '../../api/authApi';

export default function LoginForm({ onLoginSuccess, setAuthView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { token } = await loginUser({ email, password });
      localStorage.setItem('token', token);
      onLoginSuccess(); // Actualiza el estado del usuario en App.js
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Iniciar Sesión</h2>
        {error && <p className="error-message">{error}</p>}
        
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="auth-button">Ingresar</button>

        <div className="auth-links">
          <button type="button" className="link-button" onClick={() => setAuthView('register')}>
            ¿No tienes cuenta? Regístrate
          </button>
          <button type="button" className="link-button" onClick={() => setAuthView('recover')}>
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </form>
    </div>
  );
}
