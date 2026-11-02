import {getAuthToken, logoutAndClearLocalData} from './authStorage.js';

export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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

    // Clear local auth and drafts when the session has expired.
    if (response.status === 401) {
        logoutAndClearLocalData();

        if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
        }
    }

    return response;
};
