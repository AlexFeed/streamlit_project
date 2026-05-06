import {getAuthToken, logoutAndClearLocalData} from './authStorage.js';

export const API_BASE_URL = 'http://localhost:8000';

export const authFetch = async (url, options = {}) => {
    const token = getAuthToken();

    const headers = {
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    // Если истёк срок токена, удаляем все локальные данные и редиректим
    if (response.status === 401) {
        logoutAndClearLocalData();

        if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
        }
    }

    return response;
};