import { getAuthToken } from './authStorage.js';

export const API_BASE_URL = 'http://localhost:8000';

export const authFetch = async (url, options = {}) => {
    const token = getAuthToken();

    const headers = {
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        return await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers,
        });
    } catch (error) {
        throw new Error('Не удалось подключиться к серверу. Проверьте, запущен ли backend на http://localhost:8000');
    }
};