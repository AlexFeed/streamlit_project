import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { changePassword, getMe } from '../../api/authApi.js';
import useTranslation from '../../shared/i18n/useTranslation.js';

const SettingsModal = ({ onClose }) => {
  const { language, setLanguage, t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getMe()
      .then((user) => {
        if (isMounted) {
          setProfile(user);
        }
      })
      .catch((error) => {
        console.error('Could not load profile:', error);
        if (isMounted) {
          setProfileError(true);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError(t('settings.passwordMismatch'));
      return;
    }

    setIsPasswordSaving(true);
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordError('');
      toast.success(t('settings.passwordChanged'));
    } catch (error) {
      console.error('Could not change password:', error);
      setPasswordError(t('settings.passwordChangeError'));
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const username = profile?.name?.trim() || profile?.email?.split('@')[0] || '';

  return (
    <div
      className="sp-settings-modal-overlay"
      onClick={onClose}
    >
      <section
        className="sp-settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sp-settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sp-settings-modal-header">
          <h2 id="sp-settings-title">{t('settings.title')}</h2>
          <button
            type="button"
            className="sp-settings-close"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </header>

        <div className="sp-settings-columns">
          <div className="sp-settings-column sp-settings-account">
            <section className="sp-settings-section" aria-labelledby="sp-profile-heading">
              <h3 id="sp-profile-heading">{t('settings.profile')}</h3>
              {isProfileLoading ? (
                <p>{t('settings.loadingProfile')}</p>
              ) : profileError ? (
                <p className="sp-settings-error">{t('settings.profileError')}</p>
              ) : (
                <div className="sp-settings-profile-fields">
                  <label className="sp-settings-field">
                    {t('settings.username')}
                    <input type="text" value={username} readOnly />
                  </label>
                  <label className="sp-settings-field">
                    {t('settings.email')}
                    <input type="email" value={profile?.email || ''} readOnly />
                  </label>
                </div>
              )}
            </section>

            <section className="sp-settings-section" aria-labelledby="sp-language-heading">
              <h3 id="sp-language-heading">{t('settings.language')}</h3>
              <label className="sp-settings-field" htmlFor="sp-settings-language">
                <span>{t('settings.language')}</span>
                <select
                  id="sp-settings-language"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                >
                  <option value="ru">{t('settings.language.ru')}</option>
                  <option value="en">{t('settings.language.en')}</option>
                </select>
              </label>
            </section>
          </div>

          <section
            className="sp-settings-column sp-settings-password"
            aria-labelledby="sp-password-heading"
          >
            <h3 id="sp-password-heading">{t('settings.changePassword')}</h3>
            <form className="sp-settings-password-form" onSubmit={handlePasswordSubmit}>
              <label className="sp-settings-field">
                {t('settings.currentPassword')}
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={passwords.currentPassword}
                  onChange={(event) => setPasswords((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))}
                />
              </label>
              <label className="sp-settings-field">
                {t('settings.newPassword')}
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={passwords.newPassword}
                  onChange={(event) => setPasswords((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))}
                />
              </label>
              <label className="sp-settings-field">
                {t('settings.confirmPassword')}
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={passwords.confirmPassword}
                  onChange={(event) => setPasswords((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))}
                />
              </label>
              {passwordError && (
                <p className="sp-settings-error" role="alert">{passwordError}</p>
              )}
              <button type="submit" disabled={isPasswordSaving}>
                {t(isPasswordSaving ? 'settings.changingPassword' : 'settings.changePassword')}
              </button>
            </form>
          </section>
        </div>
      </section>
    </div>
  );
};

export default SettingsModal;
