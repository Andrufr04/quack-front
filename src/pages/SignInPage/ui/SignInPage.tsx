import { useContext } from "react"
import ActionButton from "../../../shared/ui/ActionButton/ui/ActionButton"
import { SVG_MOON, SVG_SUN } from "../../../shared/ui/icons/icons"
import InputForm from "../../../shared/ui/InputForm/ui/InputForm"
import RoundButton from "../../../shared/ui/RoundButton/RoundButton"
import styles from "./SignInPage.module.css"
import { AppContext } from "../../../app/providers/AppProvider/model/AppContext"

export default function SignInPage() {
    const { mode, switchMode } = useContext(AppContext)


    return <div className={styles.page}>
        <div className={styles.info}></div>



        <div className={styles.settings}>
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
                    <InputForm input={{ type: "email", id: "email", title: "Ел. пошта", placeholder: "cooluser@cat.dog" }} />
                    <div>
                        <InputForm input={{ type: "password", id: "password", title: "Пароль", placeholder: "Пароль" }} />
                        <div className={`${styles.forgotPassword} ${styles.formHelp}`}>Забули пароль?</div>
                    </div>
                </div>
                <div className={styles.formButtons}>
                    <ActionButton actionButton={{ text: "Початок роботи", onClick: () => console.log(), enabled: true }} />
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