import React from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

const AuthForm = ({ isLogin, showPassword, setShowPassword, formData, handleInputChange, handleSubmit, setIsLogin }) => {
  return (
    <div className="w-full max-w-md">
      {/* Форма */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-xl shadow-2xl shadow-orange-900/20 p-8 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
          </h3>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Введите свои данные для входа' : 'Заполните форму для создания аккаунта'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Имя</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ваше имя"
                  className="w-full bg-black border border-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-600"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="w-full bg-black border border-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full bg-black border border-gray-700 text-white pl-10 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30"
          >
            {isLogin ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-orange-400 hover:text-orange-300 text-sm transition-colors"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;