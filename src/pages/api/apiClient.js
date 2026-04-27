import { getAuthToken } from './authStorage';

export const API_BASE_URL = 'http://localhost:8000';

export const authFetch = async (url, options = {}) => {
    const token = getAuthToken();

    const headers = {
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });
};