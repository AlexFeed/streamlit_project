import React from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import useTranslation from '../../../shared/translation/useTranslation.js';

const AuthForm = ({ isLogin, showPassword, setShowPassword, formData, handleInputChange, handleSubmit, setIsLogin, error, loading }) => {
  const { t } = useTranslation();

  return (
    <div className="form-container">
      {/* Authentication form */}
      <div className="form-wrapper">
        <div className="form-header">
          <h3 className="form-title">
            {t(isLogin ? 'auth.login' : 'auth.register')}
          </h3>
          <p className="form-subtitle">
            {t(isLogin ? 'auth.loginSubtitle' : 'auth.registerSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {!isLogin && (
            <div className="input-group">
              <label className="input-label">{t('auth.name')}</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t('auth.namePlaceholder')}
                  className="input-field"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">{t('auth.email')}</label>
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
            <label className="input-label">{t('auth.password')}</label>
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
                aria-label={t(showPassword ? 'auth.password.hide' : 'auth.password.show')}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary submit-button"
            disabled={loading}
          >
            {loading
              ? t(isLogin ? 'auth.loading.login' : 'auth.loading.register')
              : t(isLogin ? 'auth.submit.login' : 'auth.submit.register')}
          </button>
        </form>

        <div className="switch-container">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="switch-button"
          >
            {t(isLogin ? 'auth.switch.toRegister' : 'auth.switch.toLogin')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;