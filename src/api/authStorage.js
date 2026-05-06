import {EDITOR_DRAFT_STORAGE_KEY} from "../pages/EditorPage/hooks/useEditorState.js";
import {DATASET_DRAFT_STORAGE_KEY} from "../pages/EditorPage/hooks/useDatasetState.js";

export const AUTH_TOKEN_KEY = 'streamlit-auth-token';
export const AUTH_USER_KEY = 'streamlit-auth-user';

export const saveAuth = ({ accessToken, access_token, user }) => {
    // Поддержка и camelCase, и OAuth2 snake_case
    const token = accessToken || access_token;

    if (!token) {
        throw new Error('Access token is required');
    }

    localStorage.setItem(AUTH_TOKEN_KEY, token);

    if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
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

export const clearEditorDrafts = () => {
    localStorage.removeItem(EDITOR_DRAFT_STORAGE_KEY);
    localStorage.removeItem(DATASET_DRAFT_STORAGE_KEY);
};

export const logoutAndClearLocalData = () => {
    clearAuth();
    clearEditorDrafts();
};