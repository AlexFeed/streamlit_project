import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import AuthForm from './components/AuthForm';

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
      <Sidebar isLogin={isLogin} />

      {/* Основная область */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-900/10 to-transparent pointer-events-none z-0" />

        <main className="flex-1 flex items-center justify-center p-8 relative z-10">
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