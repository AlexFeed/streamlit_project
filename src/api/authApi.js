import { authFetch } from './apiClient.js';

export const register = async ({ email, password }) => {
    const response = await authFetch('/auth/register', {
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

    return response.json();
};

export const login = async ({ email, password }) => {
    const response = await authFetch('/auth/login', {
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

export const getMe = async () => {
    const response = await authFetch('/auth/me');

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Unauthorized');
    }

    return response.json();
};