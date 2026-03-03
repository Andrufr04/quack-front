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

export default function SignInPage() {
    const { mode, switchMode } = useContext(AppContext)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            alert("Login failed");
        }
    };


    return <div className={styles.page}>
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
            <div className={styles.buttons}></div>
            <div className={styles.form}>
                <div className={styles.title + " bold"}>Увійти в акаунт</div>
                <div className={styles.inputGroup}>
                    <InputForm input={{ type: "email", id: "email", title: "Ел. пошта", placeholder: "cooluser@cat.dog", value: email, onChange: e => setEmail(e.target.value)}} />
                    <div>
                        <InputForm input={{ type: "password", id: "password", title: "Пароль", placeholder: "Пароль", value: password, onChange: e => setPassword(e.target.value)}} />
                        <div className={`${styles.forgotPassword} ${styles.formHelp}`}>Забули пароль?</div>
                    </div>
                </div>
                <div className={styles.formButtons}>
                    <ActionButton actionButton={{
                        text: "Початок роботи", enabled: true, onClick: handleLogin
                    }} />
                    <div className={styles.privacy}>
                        <div className={styles.line}></div>
                        <div className={styles.formHelp}>Політика конфіденційності</div>
                        <div className={styles.line}></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}