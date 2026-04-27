export const AUTH_TOKEN_KEY = 'streamlit-auth-token';
export const AUTH_USER_KEY = 'streamlit-auth-user';

export const saveAuth = ({ accessToken, user }) => {
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const getAuthToken = () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getAuthUser = () => {
    try {
        const saved = localStorage.getItem(AUTH_USER_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Ошибка чтения auth user:', error);
        return null;
    }
};

export const clearAuth = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
};