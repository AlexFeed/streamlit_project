import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import AuthForm from './components/AuthForm';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Здесь будет логика авторизации/регистрации
    console.log('Form submitted:', formData);
  };

  return (
    <div className="auth-page">
      <Sidebar isLogin={isLogin} />

      {/* Основная область */}
      <div className="main-area">
        <div className="gradient-bg" />

        <main className="main-content">
          <AuthForm
            isLogin={isLogin}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            setIsLogin={setIsLogin}
          />
        </main>
      </div>
    </div>
  );
};

export default AuthPage;