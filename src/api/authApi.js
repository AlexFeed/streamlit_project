// authApi.js

import { authFetch, API_BASE_URL } from './apiClient.js';
import {logoutAndClearLocalData} from "./authStorage.js";

// Регистрация нового пользователя + автоматический login
//
// Request:
// {
//   email: string,
//   password: string
// }
//
// Response:
// {
//   access_token: string,
//   token_type: "bearer"
// }
export const register = async ({ email, password }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);

        throw new Error(error?.detail || 'Register failed');
    }

    return login({ email, password });
};

// Login пользователя
//
// Request:
// {
//   email: string,
//   password: string
// }
//
// Response:
// {
//   user: { id, email },
//   accessToken: string
// }
export const login = async ({ email, password }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);

        throw new Error(error?.detail || 'Login failed');
    }

    return response.json();
};

// Получение текущего авторизованного пользователя
//
// Headers:
// Authorization: Bearer <token>
//
// Response:
// {
//   id: string,
//   email: string,
//   createdAt: string,
//   disabled: boolean
// }
export const getMe = async () => {
    const response = await authFetch('/auth/me');

    if (!response.ok) {
        const error = await response.json().catch(() => null);

        throw new Error(error?.detail || 'Unauthorized');
    }

    return response.json();
};

// Logout только очищает localStorage черновика и данных о токене на frontend
export const logout = () => {
    logoutAndClearLocalData()
};