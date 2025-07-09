import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import RecoveryForm from '../components/auth/RecoveryForm';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');

  const handleLoginSuccess = () => {
    alert("Login exitoso");
    // Redirige a otra vista, por ejemplo:
    // navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="tabs">
        <button onClick={() => setActiveTab('login')}>Login</button>
        <button onClick={() => setActiveTab('register')}>Registro</button>
        <button onClick={() => setActiveTab('recover')}>Recuperar</button>
      </div>

      <div className="form-area">
        {activeTab === 'login' && <LoginForm onLoginSuccess={handleLoginSuccess} />}
        {activeTab === 'register' && <RegisterForm />}
        {activeTab === 'recover' && <RecoveryForm />}
      </div>
    </div>
  );
}
