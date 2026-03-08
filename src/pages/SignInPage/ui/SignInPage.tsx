import { useContext, useState } from "react"
import ActionButton from "../../../shared/ui/ActionButton/ui/ActionButton"
import { SVG_MOON, SVG_SUN } from "../../../shared/ui/icons/icons"
import InputForm from "../../../shared/ui/InputForm/ui/InputForm"
import RoundButton from "../../../shared/ui/RoundButton/RoundButton"
import styles from "./SignInPage.module.css"
import { AppContext } from "../../../app/providers/AppProvider/model/AppContext"
import LanguageDropdown from "../../../features/changeLanguage/ui/LanguageDropdown"
import { login } from "../../../features/auth/api/login"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function SignInPage() {
    const { mode, switchMode } = useContext(AppContext)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()
    const { t } = useTranslation()

    const handleLogin = async () => {
        try {
            await login(email, password)
            navigate("/")
        } catch (err) {
        }
    };


    return <div className={styles.page}>
        <title>Quack | Вхід</title>

        <div className={styles.info}></div>

        <div className={styles.settings}>
            <LanguageDropdown />
            <RoundButton button={
                {
                    icon: mode === "light" ? SVG_MOON : SVG_SUN,
                    text: mode === "light" ? "Темна тема" : "Світла тема",
                    onClick: switchMode
                }
            } />
        </div>

        <div className={styles.signIn}>
            <div className={styles.form}>
                <div className={styles.title + " bold"}>{t("signin.title")}</div>
                <div className={styles.inputGroup}>
                    <InputForm input={{ type: "email", id: "email", title: t("signin.email"), placeholder: "cooluser@cat.dog", value: email, onChange: e => setEmail(e.target.value) }} />
                    <div>
                        <InputForm input={{ type: "password", id: "password", title: t("signin.password"), placeholder: t("signin.password"), value: password, onChange: e => setPassword(e.target.value) }} />
                        <div className={`${styles.forgotPassword} ${styles.formHelp}`}>{t("signin.forgotPassword")}</div>
                    </div>
                </div>
                <div className={styles.formButtons}>
                    <ActionButton actionButton={{
                        text: t("signin.login"), enabled: true, onClick: handleLogin
                    }} />
                    <div className={styles.privacy}>
                        <div className={styles.line}></div>
                        <div className={styles.formHelp}>{t("signin.privacy")}</div>
                        <div className={styles.line}></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}