import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en.json';
import zh from '@/locales/zh.json';
import { getState } from '@/store';

const resources = {
  en: {
    translation: en
  },
  zh: {
    translation: zh
  }
};

/**
 * 初始化 i18n
 */
async function initI18n() {
  // 从 store 获取语言配置
  const language = await getState().getLanguageFromStorage();
  const initialLanguage = language || 'zh';

  await i18next
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'zh',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

export async function changeLanguage(language: string): Promise<void> {
  try {
    getState().setLanguage(language);
  } catch (error) {
    console.error('Failed to change language:', error);
    throw error;
  }
}

/**
 * 获取当前语言
 * @returns 当前语言代码
 */
export function getCurrentLanguage(): string {
  return getState().language;
}

// 初始化 i18n
initI18n();

export default i18next;