import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Zap } from 'lucide-react';

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
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-orange-500 selection:text-white">
      {/* Левый сайдбар */}
      <aside className="w-72 bg-black border-r border-orange-900/30 flex flex-col relative overflow-hidden h-full shadow-2xl shadow-orange-900/10">
        {/* Фоновая надпись "STREAMLIT" */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="text-[10rem] font-black text-orange-900/5 rotate-12 select-none whitespace-nowrap tracking-tighter">
            STREAMLIT
          </div>
        </div>

        {/* Верхняя часть: Логотип */}
        <div className="relative z-10 p-6 flex flex-col items-center border-b border-orange-900/20">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4">
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-1">
            Stream<span className="text-orange-500">Lit</span>
          </h1>
          <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded bg-black/50 border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)] backdrop-blur-sm">
            <span className="text-xs font-mono text-orange-200">no-code builder</span>
          </div>
        </div>

        {/* Центральная часть */}
        <div className="relative z-10 flex-1 flex flex-col justify-center p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">
              {isLogin ? 'Добро пожаловать' : 'Создайте аккаунт'}
            </h2>
            <p className="text-gray-400 text-sm">
              {isLogin ? 'Войдите в свой аккаунт для продолжения' : 'Начните создавать no-code приложения'}
            </p>
          </div>
        </div>
      </aside>

      {/* Основная область */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-900/10 to-transparent pointer-events-none z-0" />

        <main className="flex-1 flex items-center justify-center p-8 relative z-10">
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
        </main>
      </div>
    </div>
  );
};

export default AuthPage;