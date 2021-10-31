import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import translationEn from './translations/en.json'
import translationPl from './translations/pl.json'

export function init() {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
      resources: {
        en: {
          translation: translationEn
        },
        pl: {
          translation: translationPl
        }
      },
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
      }
    })
}
