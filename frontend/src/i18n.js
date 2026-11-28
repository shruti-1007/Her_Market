import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import nepali from './locales/ne.js'

const initialLanguage =
  window.localStorage.getItem('hermarket_language') === 'ne' ? 'ne' : 'en'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: {} },
    ne: { translation: nepali },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  supportedLngs: ['en', 'ne'],
  interpolation: { escapeValue: false },
})

function updateDocumentLanguage(language) {
  document.documentElement.lang = language === 'ne' ? 'ne' : 'en'
  document.title = `HerMarket — ${i18n.t('Turn your skill into your business')}`
}

updateDocumentLanguage(i18n.resolvedLanguage)
i18n.on('languageChanged', updateDocumentLanguage)

export default i18n
