import { useContext, useState } from "react";
import ActionButton from "../../../shared/ui/ActionButton/ui/ActionButton";
import InputForm from "../../../shared/ui/InputForm/ui/InputForm";
import styles from "./SignInPage.module.css";
import LanguageDropdown from "../../../features/changeLanguage/ui/LanguageDropdown";
import { login } from "../../../features/auth/api/login";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ModeSwitch from "../../../widgets/ModeSwitch/ui/ModeSwitch";
import toast from "react-hot-toast";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleLogin = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await login(email, password);
            toast.success("Ви увійшли в акаунт!")
            navigate("/");
        } catch (err) {
            console.error(err);
            if (email.trim() === "" || password.trim() === "") {
                toast.error("Порожнє поле вводу!")
            } else {
                toast.error("В доступі відмовлено!")
            }
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleLogin();
    };

    return (
        <div className={styles.page}>
            <title>Quack | Вхід</title>

            <div className={styles.info}></div>

            <div className={styles.settings}>
                <LanguageDropdown />
                <ModeSwitch />
            </div>

            <div className={styles.signIn}>
                <div className={styles.form}>
                    <div className={styles.title + " bold"}>{t("signin.title")}</div>
                    <div className={styles.inputGroup}>
                        <InputForm
                            input={{
                                type: "email",
                                id: "email",
                                title: t("signin.email"),
                                placeholder: "cooluser@cat.dog",
                                value: email,
                                onChange: e => setEmail(e.target.value),
                                
                            }}
                        />
                        <div>
                            <InputForm
                                input={{
                                    type: "password",
                                    id: "password",
                                    title: t("signin.password"),
                                    placeholder: t("signin.password"),
                                    value: password,
                                    onChange: e => setPassword(e.target.value),
                                    onKeyDown: handleKeyDown,
                                }}
                            />
                            <div className={`${styles.forgotPassword} ${styles.formHelp}`}>
                                {t("signin.forgotPassword")}
                            </div>
                        </div>
                    </div>
                    <div className={styles.formButtons}>
                        <ActionButton
                            actionButton={{
                                text: loading ? (
                                    <div className={styles.loading}>
                                        <img className={styles.img}
                                        src="/gifs/loading.svg"
                                        alt="loading"
                                        style={{ width: 60, height: 60, marginTop: 5 }}
                                        />
                                    </div>
                                ) : (
                                    t("signin.login")
                                ),
                                enabled: !loading,
                                onClick: handleLogin,
                                bgcolor: "#ec8735"
                            }}
                        />
                        <div className={styles.privacy}>
                            <div className={styles.line}></div>
                            <div className={styles.formHelp}>{t("signin.privacy")}</div>
                            <div className={styles.line}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}