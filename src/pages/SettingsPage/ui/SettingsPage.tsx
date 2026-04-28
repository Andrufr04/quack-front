import { Link } from "react-router-dom";
import { AppContext } from "../../../app/providers/AppProvider/model/AppContext";
import { apiRequest } from "../../../shared/api/api";
import { SVG_PLUS } from "../../../shared/ui/icons/icons";
import styles from "./SettingsPage.module.css"
import { useState, useEffect, useRef, useContext } from "react";
import toast from "react-hot-toast";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('theme');

    return (
        <>
        <title>Quack | Налаштування</title>
        <div className={styles.container}>
            <div className={styles.settings}>
                <div className={styles.tabs}>
                    <div className={styles.tabsUpper}>
                        <div
                            className={`${styles.tab} ${activeTab === 'theme' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('theme')}
                        >
                            Тема
                        </div>
                        {/* 🔥 Додано клас interfaceTab для приховування на мобілках */}
                        <div
                            className={`${styles.tab} ${styles.interfaceTab} ${activeTab === 'interface' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('interface')}
                        >
                            Інтерфейс
                        </div>
                        <div
                            className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            Профіль
                        </div>
                        <div
                            className={`${styles.tab} ${activeTab === 'account' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('account')}
                        >
                            Акаунт
                        </div>
                    </div>
                    <div className={styles.tabPrivacy}>
                        <Link to="/privacy" className={styles.tab} style={{ textDecoration: 'none' }}>Політика конфіденційності</Link>
                    </div>

                </div>

                <div className={styles.line}></div>

                <div className={styles.options}>
                    {activeTab === 'theme' && <ThemeSettings />}
                    {activeTab === 'interface' && <InterfaceSettings />}
                    {activeTab === 'profile' && <ProfileSettings />}
                    {activeTab === 'account' && <AccountSettings />}
                </div>
            </div>
        </div>
        </>
    );
}

function AccountSettings() {
    const { mode } = useContext(AppContext);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loadingPass, setLoadingPass] = useState(false);

    const [newEmail, setNewEmail] = useState("");
    const [emailCode, setEmailCode] = useState("");
    const [emailStep, setEmailStep] = useState<0 | 1>(0);
    const [loadingEmail, setLoadingEmail] = useState(false);

    const hasPassChanges = oldPassword.length > 0 && newPassword.length > 0 && confirmPassword.length > 0;

    const handleSavePassword = async () => {
        if (!hasPassChanges) return;
        if (newPassword !== confirmPassword) return toast.error("Нові паролі не співпадають!");
        if (newPassword.length < 8) return toast.error("Новий пароль має містити мінімум 8 символів!");
        if (oldPassword === newPassword) return toast.error("Новий пароль повинен відрізнятись від старого!");

        setLoadingPass(true);
        try {
            const res = await apiRequest('/change-password/', {
                method: 'POST',
                body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
            });

            if (res?.ok) {
                toast.success("Пароль успішно змінено!");
                setOldPassword(""); setNewPassword(""); setConfirmPassword("");
            } else {
                const data = await res?.json();
                toast.error(data?.error || "Не вдалося змінити пароль");
            }
        } catch (e) {
            toast.error("Помилка сервера");
        } finally {
            setLoadingPass(false);
        }
    };

    const handleRequestEmailCode = async () => {
        if (!newEmail.trim()) return toast.error("Введіть нову пошту!");
        setLoadingEmail(true);
        try {
            const res = await apiRequest('/email-change-request/', {
                method: 'POST',
                body: JSON.stringify({ new_email: newEmail, theme: mode })
            });
            if (res?.ok) {
                toast.success(`Код відправлено на ${newEmail}`);
                setEmailStep(1);
            } else {
                const data = await res?.json();
                toast.error(data?.error || "Помилка відправки коду");
            }
        } catch (e) {
            toast.error("Помилка сервера");
        } finally {
            setLoadingEmail(false);
        }
    };

    const handleConfirmEmail = async () => {
        if (!emailCode.trim()) return toast.error("Введіть код!");
        setLoadingEmail(true);
        try {
            const res = await apiRequest('/email-change-confirm/', {
                method: 'POST',
                body: JSON.stringify({ new_email: newEmail, code: emailCode })
            });
            if (res?.ok) {
                toast.success("Пошту успішно змінено!");
                setEmailStep(0);
                setNewEmail("");
                setEmailCode("");
            } else {
                const data = await res?.json();
                toast.error(data?.error || "Невірний код");
            }
        } catch (e) {
            toast.error("Помилка сервера");
        } finally {
            setLoadingEmail(false);
        }
    };

    // Твої оригінальні стилі інпутів, тільки 14px -> 0.875em
    const inputStyle = {
        width: '100%', background: 'var(--color-opaque-secondary)', border: '1px solid var(--color-gray)',
        borderRadius: 'var(--radius-secondary)', padding: '0.8rem', color: 'var(--color-text)',
        fontFamily: 'inherit', fontSize: '0.875em', outline: 'none', marginBottom: '15px', transition: 'border-color 0.2s'
    };

    return (
        <div className={styles.profileSettings} style={{ height: '100%', overflowY: 'auto', paddingRight: '10px' }}>

            <div className={styles.settingItem} style={{ marginBottom: '20px' }}>
                <div className={styles.title}>Електронна пошта</div>
                <div style={{ marginTop: '10px', maxWidth: '400px' }}>
                    {emailStep === 0 ? (
                        <>
                            <input
                                type="email" placeholder="Введіть нову пошту"
                                value={newEmail} onChange={e => setNewEmail(e.target.value)} style={inputStyle}
                            />
                            <button
                                className={styles.saveBtn} onClick={handleRequestEmailCode} disabled={loadingEmail || !newEmail}
                                style={{ opacity: (!newEmail || loadingEmail) ? 0.5 : 1, width: '100%' }}
                            >
                                {loadingEmail ? "Відправка..." : "Надіслати код підтвердження"}
                            </button>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '0.8125em', opacity: 0.7, marginBottom: '10px' }}>Код відправлено на {newEmail}</div>
                            <input
                                type="text" placeholder="6-значний код" maxLength={6}
                                value={emailCode} onChange={e => setEmailCode(e.target.value)} style={inputStyle}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    className={styles.saveBtn} onClick={() => { setEmailStep(0); setEmailCode(""); }}
                                    style={{ background: 'transparent', border: '1px solid var(--color-gray)', color: 'var(--color-text)', flex: 1 }}
                                >
                                    Скасувати
                                </button>
                                <button
                                    className={styles.saveBtn} onClick={handleConfirmEmail} disabled={loadingEmail || !emailCode}
                                    style={{ opacity: (!emailCode || loadingEmail) ? 0.5 : 1, flex: 1 }}
                                >
                                    {loadingEmail ? "Перевірка..." : "Підтвердити"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.settingItem}>
                <div className={styles.title}>Зміна паролю</div>
                <div style={{ marginTop: '10px', maxWidth: '400px' }}>
                    <input
                        type="password" placeholder="Поточний пароль"
                        value={oldPassword} onChange={e => setOldPassword(e.target.value)} style={inputStyle}
                    />
                    <input
                        type="password" placeholder="Новий пароль (мінімум 8 символів)"
                        value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle}
                    />
                    <input
                        type="password" placeholder="Підтвердження нового паролю"
                        value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle}
                    />
                    <button
                        className={styles.saveBtn} onClick={handleSavePassword} disabled={!hasPassChanges || loadingPass}
                        style={{ opacity: (!hasPassChanges || loadingPass) ? 0.5 : 1, width: '100%' }}
                    >
                        {loadingPass ? "Збереження..." : "Змінити пароль"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function InterfaceSettings() {
    const [savedHover, setSavedHover] = useState(() => localStorage.getItem('sidebar_hover') === 'true');
    const [savedKeepOpen, setSavedKeepOpen] = useState(() => localStorage.getItem('sidebar_keep_open') === 'true');
    const [savedTooltips, setSavedTooltips] = useState(() => localStorage.getItem('sidebar_tooltips') !== 'false');

    const [openOnHover, setOpenOnHover] = useState(savedHover);
    const [keepOpenOnNav, setKeepOpenOnNav] = useState(savedKeepOpen);
    const [showTooltips, setShowTooltips] = useState(savedTooltips);

    const hasChanges = openOnHover !== savedHover || keepOpenOnNav !== savedKeepOpen || showTooltips !== savedTooltips;

    const handleSave = () => {
        localStorage.setItem('sidebar_hover', openOnHover.toString());
        localStorage.setItem('sidebar_keep_open', keepOpenOnNav.toString());
        localStorage.setItem('sidebar_tooltips', showTooltips.toString());

        setSavedHover(openOnHover);
        setSavedKeepOpen(keepOpenOnNav);
        setSavedTooltips(showTooltips);

        window.dispatchEvent(new Event('interface_settings_changed'));
        toast.success("Налаштування інтерфейсу збережено!");
    };

    return (
        <div className={styles.themeSettingsContainer}>
            <div className={styles.themeSettings}>
                <div className={styles.themeSettingsPart}>
                    <div className={styles.title}>Бокове меню (Sidebar)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                        <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={openOnHover}
                                onChange={(e) => setOpenOnHover(e.target.checked)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '1em' }}>Відкривається при наведенні</span>
                        </label>
                        <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={keepOpenOnNav}
                                onChange={(e) => setKeepOpenOnNav(e.target.checked)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '1em' }}>Не закривати при переході на іншу сторінку</span>
                        </label>
                        <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={showTooltips}
                                onChange={(e) => setShowTooltips(e.target.checked)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '1em' }}>Показувати підказки при наведенні</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className={styles.containerSave}>
                <div className={styles.saveContainer}>
                    <button
                        className={styles.saveBtn}
                        disabled={!hasChanges}
                        onClick={handleSave}
                    >
                        {hasChanges ? "Зберегти зміни" : "Зміни збережено"}
                    </button>

                </div>
            </div>
        </div>
    );
}

function ThemeSettings() {
    const { mode, setMode } = useContext(AppContext)
    const [savedColor, setSavedColor] = useState(() => localStorage.getItem('color') || THEME_COLORS[0]);
    const [currentColor, setCurrentColor] = useState(savedColor);

    useEffect(() => {
        document.documentElement.style.setProperty('--color-main', savedColor);
    }, [savedColor]);

    const hasChanges = currentColor !== savedColor;

    const handleSave = () => {
        localStorage.setItem('color', currentColor);
        setSavedColor(currentColor);
    };

    return (
        <div className={styles.themeSettingsContainer}>
            <div className={styles.themeSettings}>
                <div className={styles.themeSettingsPart}>
                    <div className={styles.title}>Тема</div>
                    <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="theme"
                                value="dark"
                                checked={mode === 'dark'}
                                onChange={() => setMode('dark')}
                                className={styles.radioInput}
                            />
                            <span>Темна</span>
                        </label>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="theme"
                                value="light"
                                checked={mode === 'light'}
                                onChange={() => setMode('light')}
                                className={styles.radioInput}
                            />
                            <span>Світла</span>
                        </label>
                    </div>
                </div>

                <div className={styles.themeSettingsPart}>
                    <div className={styles.title}>Основний колір</div>
                    <ColorGrid selectedColor={currentColor} onColorSelect={setCurrentColor} />
                </div>
            </div>

            <div className={styles.containerSave}>
                <div className={styles.saveContainer}>
                    <button
                        className={styles.saveBtn}
                        disabled={!hasChanges}
                        onClick={handleSave}
                    >
                        {hasChanges ? "Зберегти зміни" : "Зміни збережено"}
                    </button>
                </div>
            </div>
        </div>
    );
}

const THEME_COLORS = [
    '#FE9E52', '#ac1616', '#f6ca46', '#8eea38', '#42e3d5',
    '#4a4df4', '#9437e5', '#ef3ee0', '#ef417b', '#64748B'
];
function ColorGrid({ selectedColor, onColorSelect }: { selectedColor: string, onColorSelect: (c: string) => void }) {
    return (
        <div className={styles.colorGrid}>
            {THEME_COLORS.map((color) => (
                <div
                    key={color}
                    className={`${styles.colorCircle} ${selectedColor === color ? styles.selectedColor : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => onColorSelect(color)}
                ></div>
            ))}
        </div>
    );
}

function ProfileSettings() {
    const [description, setDescription] = useState("");
    const maxChars = 500;

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await apiRequest('/profiles/my/');
                if (res?.ok) {
                    const data = await res.json();
                    setDescription(data.description || "");
                    setAvatarPreview(data.profile_picture || null);
                    setBannerPreview(data.banner_picture || null);
                    setHasChanges(false);
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            }
        };
        fetchProfile();
    }, []);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setHasChanges(true);
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
            setHasChanges(true);
        }
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
        setHasChanges(true);
    };

    const handleSaveProfile = async () => {
        if (!hasChanges || loading) return;
        setLoading(true);

        const formData = new FormData();
        formData.append("description", description);

        if (avatarFile) formData.append("profile_picture", avatarFile);
        if (bannerFile) formData.append("banner_picture", bannerFile);

        try {
            const res = await apiRequest('/profiles/my/', {
                method: 'PATCH',
                body: formData
            });

            if (res?.ok) {
                toast.success("Профіль успішно оновлено!");
                setHasChanges(false);
                setAvatarFile(null);
                setBannerFile(null);
            } else {
                toast.error("Не вдалося оновити профіль.");
            }
        } catch (error) {
            toast.error("Помилка при збереженні.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.profileSettings}>
            <div className={styles.settingItem}>
                <div className={styles.title}>Фото профілю</div>
                <div className={styles.avatarUpload}>
                    <div
                        className={styles.avatarPreview}
                        onClick={() => avatarInputRef.current?.click()}
                        style={{
                            backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        {!avatarPreview && <div className={styles.uploadIcon}>{SVG_PLUS}</div>}
                    </div>
                    <input
                        type="file"
                        ref={avatarInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleAvatarChange}
                    />
                </div>
            </div>

            <div className={styles.settingItem}>
                <div className={styles.title}>Банер профілю</div>
                <div className={styles.bannerUpload}>
                    <div
                        className={styles.bannerPreview}
                        onClick={() => bannerInputRef.current?.click()}
                        style={{
                            backgroundImage: bannerPreview ? `url(${bannerPreview})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        {!bannerPreview && <div className={styles.uploadIcon}>{SVG_PLUS}</div>}
                    </div>
                    <input
                        type="file"
                        ref={bannerInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleBannerChange}
                    />
                </div>
            </div>

            <div className={styles.settingItem}>
                <div className={styles.title}>Про себе</div>
                <div className={styles.textareaWrapper}>
                    <textarea
                        className={styles.textarea}
                        placeholder="Розкажіть щось цікаве..."
                        value={description}
                        maxLength={maxChars}
                        onChange={handleDescriptionChange}
                    />
                    <div className={styles.charCounter}>
                        {description.length}/{maxChars}
                    </div>
                </div>
            </div>

            <div className={styles.containerSave}>
                <div className={styles.saveContainer}>
                    <button
                        className={styles.saveBtn}
                        onClick={handleSaveProfile}
                        disabled={!hasChanges || loading}
                        style={{ opacity: (!hasChanges || loading) ? 0.5 : 1, cursor: (!hasChanges || loading) ? 'default' : 'pointer' }}
                    >
                        {loading ? "Збереження..." : hasChanges ? "Зберегти зміни" : "Зміни збережено"}
                    </button>
                </div>
            </div>
        </div>
    );
}