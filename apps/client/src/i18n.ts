import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

export function init() {
  i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
      // the translations
      // (tip move them in a JSON file and import them,
      // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
      resources: {
        en: {
          translation: {
            navigation: {
              events: 'Events',
              virtual_challenges: 'Virtual Challenges'
            },
            event: {
              solution: 'Solution',
              missing_checkpoints: 'Missing',
              actions: {
                invite: 'Copy invitation link'
              }
            }
          }
        },
        pl: {
          translation: {
            navigation: {
              events: 'Biegi',
              virtual_challenges: 'Wyzwania'
            },
            event: {
              solution: 'Rozwiązanie',
              missing_checkpoints: 'Brakujące punkty',
              actions: {
                invite: 'Skopiuj link do zaproszenia'
              }
            }
          }
        }
      },
      lng: 'en', // if you're using a language detector, do not define the lng option
      fallbackLng: "en",
      interpolation: {
        escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
      }
    })
}
