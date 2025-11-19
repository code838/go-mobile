import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import am from '@/locales/am.json';
import ar from '@/locales/ar.json';
import az from '@/locales/az.json';
import be from '@/locales/be.json';
import bn from '@/locales/bn.json';
import cs from '@/locales/cs.json';
import da from '@/locales/da.json';
import de from '@/locales/de.json';
import el from '@/locales/el.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import hr from '@/locales/hr.json';
import hu from '@/locales/hu.json';
import id from '@/locales/id.json';
import it from '@/locales/it.json';
import ja from '@/locales/ja.json';
import kk from '@/locales/kk.json';
import km from '@/locales/km.json';
import ky from '@/locales/ky.json';
import lo from '@/locales/lo.json';
import lt from '@/locales/lt.json';
import lv from '@/locales/lv.json';
import my from '@/locales/my.json';
import pl from '@/locales/pl.json';
import pt from '@/locales/pt.json';
import ro from '@/locales/ro.json';
import ru from '@/locales/ru.json';
import si from '@/locales/si.json';
import sk from '@/locales/sk.json';
import sl from '@/locales/sl.json';
import sv from '@/locales/sv.json';
import uk from '@/locales/uk.json';
import uz from '@/locales/uz.json';
import vi from '@/locales/vi.json';
import zh_TW from '@/locales/zh-TW.json';
import zh from '@/locales/zh.json';
import { getState } from '@/store';

const resources = {
  'zh_cn': {
    translation: zh
  },
  'zh_tw': {
    translation: zh_TW
  },
  'en': {
    translation: en
  },
  'az': {
    translation: az
  },
  'be': {
    translation: be
  },
  'bn': {
    translation: bn
  },
  'cs': {
    translation: cs
  },
  'da': {
    translation: da
  },
  'de': {
    translation: de
  },
  'el': {
    translation: el
  },
  'es': {
    translation: es
  },
  'fr': {
    translation: fr
  },
  'hr': {
    translation: hr
  },
  'hu': {
    translation: hu
  },
  'id': {
    translation: id
  },
  'it': {
    translation: it
  },
  'ja': {
    translation: ja
  },
  'kk': {
    translation: kk
  },
  'si': {
    translation: si
  },
  'my': {
    translation: my
  },
  'lo': {
    translation: lo
  },
  'ky': {
    translation: ky
  },
  'lt': {
    translation: lt
  },
  'lv': {
    translation: lv
  },
  'pl': {
    translation: pl
  },
  'pt': {
    translation: pt
  },
  'ro': {
    translation: ro
  },
  'ru': {
    translation: ru
  },
  'sk': {
    translation: sk
  },
  'sl': {
    translation: sl
  },
  'sv': {
    translation: sv
  },
  'uk': {
    translation: uk
  },
  'uz': {
    translation: uz
  },
  'vi': {
    translation: vi
  },
  'km': {
    translation: km
  },
  'ar': {
    translation: ar
  },
  'am': {
    translation: am
  },
};

/**
 * 初始化 i18n
 */
async function initI18n() {
  // 从 store 获取语言配置
  const language = await getState().getLanguageFromStorage();
  const initialLanguage = language || 'zh_cn';

  await i18next
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'en',
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
    await i18next.changeLanguage(language);
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
