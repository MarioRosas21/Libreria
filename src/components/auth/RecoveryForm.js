// src/components/auth/RecoveryForm.js

import React, { useState } from 'react';
import { getSecretQuestion, verifySecretAnswer } from '../../api/authApi';

export default function RecoveryForm({ setAuthView }) {
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [stage, setStage] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchQuestion = async () => {
    try {
      const res = await getSecretQuestion(email);
      setQuestion(res.question);
      setStage(2);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener la pregunta');
    }
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    try {
      const res = await verifySecretAnswer({
        email,
        secretAnswer: answer,
        newPassword
      });
      setMessage(res.message);
      setError('');
      setTimeout(() => setAuthView('login'), 2000); // Redirige al login tras éxito
    } catch (err) {
      setError(err.response?.data?.message || 'Error al recuperar contraseña');
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Recuperar Contraseña</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      {stage === 1 && (
        <div className="auth-form">
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button onClick={fetchQuestion} className="auth-button">
            Obtener Pregunta
          </button>
          <button
            type="button"
            className="link-button"
            onClick={() => setAuthView('login')}
          >
            Volver al inicio de sesión
          </button>
        </div>
      )}

      {stage === 2 && (
        <form onSubmit={handleRecovery} className="auth-form">
          <p><strong>Pregunta:</strong> {question}</p>

          <input
            type="text"
            placeholder="Respuesta"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button type="submit" className="auth-button">Cambiar Contraseña</button>
        </form>
      )}
    </div>
  );
}
