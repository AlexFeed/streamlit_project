import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AuthForm from './components/AuthForm';
import { login, register } from '../../api/authApi.js';
import { saveAuth, getAuthToken } from '../../api/authStorage.js';
import './AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getAuthToken()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const authResponse = isLogin
        ? await login({
            email: formData.email,
            password: formData.password,
          })
        : await register({
            email: formData.email,
            password: formData.password,
          });

      saveAuth(authResponse);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
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