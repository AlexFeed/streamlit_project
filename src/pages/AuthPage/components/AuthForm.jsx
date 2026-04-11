import React from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

const AuthForm = ({ isLogin, showPassword, setShowPassword, formData, handleInputChange, handleSubmit, setIsLogin }) => {
  return (
    <div className="form-container">
      {/* Форма */}
      <div className="form-wrapper">
        <div className="form-header">
          <h3 className="form-title">
            {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
          </h3>
          <p className="form-subtitle">
            {isLogin ? 'Введите свои данные для входа' : 'Заполните форму для создания аккаунта'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Имя</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ваше имя"
                  className="input-field"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Пароль</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="input-field password-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
          >
            {isLogin ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>

        <div className="switch-container">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="switch-button"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;