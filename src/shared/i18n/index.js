import ru from './ru.js';
import en from './en.js';

export const dictionaries = { ru, en };
export const SUPPORTED_LANGS = ['ru', 'en'];
export const DEFAULT_LANG = 'ru';

export function getDictionary(lang) {
  return dictionaries[lang] ?? dictionaries[DEFAULT_LANG];
}
