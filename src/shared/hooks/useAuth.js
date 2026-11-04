import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as authApi from '../../api/authApi.js';
import { getAuthToken, saveAuth } from '../../api/authStorage.js';
import useTranslation from './../translation/useTranslation.js';

export const useAuth = ({ autoFetchProfile = false } = {}) => {
    const { t } = useTranslation();
    const [profile, setProfile] = useState(null);
    const [isProfileLoading, setIsProfileLoading] = useState(autoFetchProfile);
    const [profileError, setProfileError] = useState(false);
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);

    const loadProfile = useCallback(async () => {
        try {
            setIsProfileLoading(true);
            setProfileError(false);
            const user = await authApi.getMe();
            setProfile(user);
            return user;
        } catch (error) {
            console.error('Could not load profile:', error);
            setProfileError(true);
            return null;
        } finally {
            setIsProfileLoading(false);
        }
    }, []);

    useEffect(() => {
        if (autoFetchProfile) {
            loadProfile();
        }
    }, [autoFetchProfile, loadProfile]);

    const changeUserPassword = useCallback(async ({ currentPassword, newPassword }) => {
        try {
            setIsPasswordSaving(true);
            await authApi.changePassword({ currentPassword, newPassword });
            toast.success(t('settings.passwordChanged'));
            return { success: true };
        } catch (error) {
            console.error('Could not change password:', error);
            return {
                success: false,
                error: t('settings.passwordChangeError'),
            };
        } finally {
            setIsPasswordSaving(false);
        }
    }, [t]);

    const login = useCallback(async (credentials) => {
        const authResponse = await authApi.login(credentials);
        saveAuth(authResponse);
        return authResponse;
    }, []);

    const register = useCallback(async (payload) => {
        const authResponse = await authApi.register(payload);
        saveAuth(authResponse);
        return authResponse;
    }, []);

    const logout = useCallback(() => {
        authApi.logout();
    }, []);

    const isAuthenticated = useCallback(() => {
        return Boolean(getAuthToken());
    }, []);

    return {
        profile,
        isProfileLoading,
        profileError,
        isPasswordSaving,
        loadProfile,
        changeUserPassword,
        login,
        register,
        logout,
        isAuthenticated,
    };
};

export default useAuth;