import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import en from "./lang/en.json"
import uk from "./lang/uk.json"

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      uk: { translation: uk },
    },
    lng: "uk",
    fallbackLng: "uk",
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n