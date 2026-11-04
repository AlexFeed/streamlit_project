import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AuthForm from './components/AuthForm';
import useAuth from '../../shared/hooks/useAuth.js';
import useTranslation from '../../shared/translation/useTranslation.js';
import './AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, register, isAuthenticated } = useAuth();

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
    if (isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
      }

      navigate('/', { replace: true });
    } catch {
      setError(t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="page-container auth-page">
        <Sidebar isLogin={isLogin} />

        {/* Main area */}
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
                error={error}
                loading={loading}
            />
          </main>
        </div>
      </div>
  );
};

export default AuthPage;