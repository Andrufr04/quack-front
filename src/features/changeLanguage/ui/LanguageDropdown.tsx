import { languages } from "../../../shared/config/i18n/languages"
import { useTranslation } from "react-i18next"

export default function LanguageDropdown() {
    const { i18n } = useTranslation()
    const setLanguage = (lang: string) => {
        i18n.changeLanguage(lang)
    }

    return <div>
        <select name="language" id="language" onChange={(e) => setLanguage(e.target.value)} value={i18n.resolvedLanguage}>
            {Object.entries(languages).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
        </select>
    </div>
}