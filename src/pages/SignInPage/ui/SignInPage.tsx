import { useContext, useState } from "react";
import ActionButton from "../../../shared/ui/ActionButton/ui/ActionButton";
import InputForm from "../../../shared/ui/InputForm/ui/InputForm";
import styles from "./SignInPage.module.css";
import LanguageDropdown from "../../../features/changeLanguage/ui/LanguageDropdown";
import { login } from "../../../features/auth/api/login";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ModeSwitch from "../../../widgets/ModeSwitch/ui/ModeSwitch";
import toast from "react-hot-toast";
import { apiRequest } from "../../../shared/api/api"; 

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    // 🔥 Стейти для відновлення паролю 🔥
    const [resetStep, setResetStep] = useState<0 | 1 | 2>(0); 
    const [resetEmail, setResetEmail] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [resetLoading, setResetLoading] = useState(false);

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

    const handleRequestCode = async () => {
        if (!resetEmail.trim()) return toast.error("Введіть email!");
        setResetLoading(true);
        const currentTheme = localStorage.getItem('mode') === 'dark' ? 'dark' : 'light';
        try {
            const res = await apiRequest('/password-reset/', { 
                method: 'POST',
                body: JSON.stringify({ email: resetEmail, theme: currentTheme })
            });
            if (res?.ok) {
                toast.success("Код відправлено на пошту!");
                setResetStep(2);
            } else {
                toast.error("Помилка відправки коду.");
            }
        } catch (e) {
            toast.error("Помилка сервера");
        } finally {
            setResetLoading(false);
        }
    };

    const handleConfirmReset = async () => {
        if (!resetCode.trim() || !newPassword.trim()) return toast.error("Заповніть всі поля!");
        if (newPassword.length < 8) return toast.error("Пароль має містити мінімум 8 символів!");
        
        setResetLoading(true);
        try {
            const res = await apiRequest('/password-reset-confirm/', {
                method: 'POST',
                body: JSON.stringify({ 
                    email: resetEmail, 
                    code: resetCode, 
                    new_password: newPassword 
                })
            });
            
            if (res?.ok) {
                toast.success("Пароль успішно змінено!");
                setResetStep(0); 
                setEmail(resetEmail); 
                setPassword("");
            } else {
                const data = await res?.json();
                toast.error(data?.error || "Невірний код або помилка");
            }
        } catch (e) {
            toast.error("Помилка сервера");
        } finally {
            setResetLoading(false);
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
                            
                            <div 
                                className={`${styles.forgotPassword} ${styles.formHelp}`}
                                onClick={() => setResetStep(1)}
                            >
                                {t("signin.forgotPassword")}
                            </div>
                        </div>
                    </div>
                    
                    <div className={styles.formButtons}>
                        <ActionButton
                            actionButton={{
                                text: loading ? "Завантаження..." : t("signin.login"),
                                enabled: !loading,
                                onClick: handleLogin,
                                bgcolor: "#ec8735"
                            }}
                        />
                        <div className={styles.privacy}>
                            <div className={styles.line}></div>
                            <Link to="/privacy" className={styles.formHelp}>{t("signin.privacy")}</Link>
                            <div className={styles.line}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔥 МОДАЛКА ВІДНОВЛЕННЯ ПАРОЛЮ 🔥 */}
            {resetStep > 0 && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
                }}>
                    <div className={styles.formModal} style={{ position: 'relative' }}>
                        <div 
                            style={{ position: 'absolute', top: '15px', right: '20px', cursor: 'pointer', fontSize: '1.25em', color: 'var(--color-text)' }}
                            onClick={() => { setResetStep(0); setResetLoading(false); }}
                        >✕</div>

                        <div className={styles.title + " bold"}>
                            {resetStep === 1 ? "Відновлення паролю" : "Підтвердження коду"}
                        </div>

                        {resetStep === 1 && (
                            <div className={styles.inputGroup}>
                                <p style={{ color: 'var(--color-text)', opacity: 0.8, fontSize: '0.875em', marginBottom: '15px' }}>
                                    Введіть вашу електронну пошту, і ми надішлемо вам 6-значний код підтвердження.
                                </p>
                                <InputForm
                                    input={{
                                        type: "email", id: "resetEmail", title: "Ваш Email",
                                        placeholder: "cooluser@cat.dog", value: resetEmail,
                                        onChange: e => setResetEmail(e.target.value),
                                    }}
                                />
                                <div style={{ marginTop: '10px' }}>
                                    <ActionButton
                                        actionButton={{
                                            text: resetLoading ? "Відправка..." : "Надіслати код",
                                            enabled: !resetLoading, onClick: handleRequestCode, bgcolor: "#ec8735"
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {resetStep === 2 && (
                            <div className={styles.inputGroup}>
                                <p style={{ color: 'var(--color-text)', opacity: 0.8, fontSize: '0.875em', marginBottom: '15px' }}>
                                    Код надіслано на {resetEmail}
                                </p>
                                <InputForm
                                    input={{
                                        type: "text", id: "resetCode", title: "6-значний код",
                                        placeholder: "123456", value: resetCode, maxLength: 6,
                                        onChange: e => setResetCode(e.target.value),
                                    }}
                                />
                                <div style={{ marginTop: '5px' }}>
                                    <InputForm
                                        input={{
                                            type: "password", id: "newPassword", title: "Новий пароль",
                                            placeholder: "Мінімум 8 символів", value: newPassword,
                                            onChange: e => setNewPassword(e.target.value),
                                        }}
                                    />
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    <ActionButton
                                        actionButton={{
                                            text: resetLoading ? "Збереження..." : "Змінити пароль",
                                            enabled: !resetLoading, onClick: handleConfirmReset, bgcolor: "#ec8735"
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}