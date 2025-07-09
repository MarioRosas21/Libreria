// src/components/auth/RegisterForm.js

import React, { useState } from 'react';
import { registerUser } from '../../api/authApi';

export default function RegisterForm({ setAuthView }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    secretQuestion: '',
    secretAnswer: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser(form);
      setMessage(res.message);
      setError('');
      setTimeout(() => setAuthView('login'), 2000); // Redirige al login tras éxito
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar');
      setMessage('');
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleRegister} className="auth-form">
        <h2>Registro de Usuario</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <input
          type="email"
          placeholder="Correo"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Pregunta secreta"
          value={form.secretQuestion}
          onChange={(e) => setForm({ ...form, secretQuestion: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Respuesta secreta"
          value={form.secretAnswer}
          onChange={(e) => setForm({ ...form, secretAnswer: e.target.value })}
          required
        />

        <button type="submit" className="auth-button">Registrarse</button>

        <button
          type="button"
          className="link-button"
          onClick={() => setAuthView('login')}
        >
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </form>
    </div>
  );
}
