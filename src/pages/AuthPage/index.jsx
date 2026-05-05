import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AuthForm from './components/AuthForm';
import { login as apiLogin, register as apiRegister } from '../../api/authApi';
import { saveAuth } from '../../api/authStorage';
import { useAuth } from '../../contexts/AuthContext';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await apiLogin({ email: formData.email, password: formData.password });
      } else {
        response = await apiRegister({ name: formData.name, email: formData.email, password: formData.password });
      }

      // Сохраняем токен и пользователя
      saveAuth({ accessToken: response.access_token, user: response.user });

      // Обновляем контекст
      login(response.user);

      // Перенаправляем на главную
      navigate('/');
    } catch (err) {
      setError(err.message || 'Произошла ошибка');
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
            loading={loading}
            error={error}
          />
        </main>
      </div>
    </div>
  );
};

export default AuthPage;