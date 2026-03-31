import { AppContext } from "../../../app/providers/AppProvider/model/AppContext";
import { apiRequest } from "../../../shared/api/api";
import { SVG_PLUS } from "../../../shared/ui/icons/icons";
import styles from "./SettingsPage.module.css"
import { useState, useEffect, useRef, useContext } from "react";
import toast from "react-hot-toast";

/*
Откр при наведении
Не закрівался при переходе на страничку
Нужні ли подсказки при наведении
*/

export default function SettingsPage() {
    // 1. Создаем стейт для вкладок. По умолчанию открыта 'theme'
    const [activeTab, setActiveTab] = useState('theme');

    return (
        <div className={styles.container}>
            <div className={styles.settings}>
                <div className={styles.tabs}>
                    <div
                        className={`${styles.tab} ${activeTab === 'theme' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('theme')}
                    >
                        Тема
                    </div>
                    <div
                        className={`${styles.tab} ${activeTab === 'interface' ? styles.activeTab : ''}`}
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
                </div>

                <div className={styles.line}></div>

                <div className={styles.options}>
                    {/* 2. Условный рендеринг: показываем компонент в зависимости от activeTab */}
                    {activeTab === 'theme' && <ThemeSettings />}
                    {activeTab === 'interface' && <InterfaceSettings />}
                    {activeTab === 'profile' && <ProfileSettings />}
                </div>
            </div>
        </div>
    );
}

function InterfaceSettings() {
    // 1. Ініціалізуємо з localStorage (дефолтні значення: false, false, true)
    const [savedHover, setSavedHover] = useState(() => localStorage.getItem('sidebar_hover') === 'true');
    const [savedKeepOpen, setSavedKeepOpen] = useState(() => localStorage.getItem('sidebar_keep_open') === 'true');
    const [savedTooltips, setSavedTooltips] = useState(() => localStorage.getItem('sidebar_tooltips') !== 'false'); // За замовчуванням true

    // 2. Локальні стейти для чекбоксів
    const [openOnHover, setOpenOnHover] = useState(savedHover);
    const [keepOpenOnNav, setKeepOpenOnNav] = useState(savedKeepOpen);
    const [showTooltips, setShowTooltips] = useState(savedTooltips);

    const hasChanges = openOnHover !== savedHover || keepOpenOnNav !== savedKeepOpen || showTooltips !== savedTooltips;

    const handleSave = () => {
        // Зберігаємо в localStorage
        localStorage.setItem('sidebar_hover', openOnHover.toString());
        localStorage.setItem('sidebar_keep_open', keepOpenOnNav.toString());
        localStorage.setItem('sidebar_tooltips', showTooltips.toString());

        // Оновлюємо збережені стейти
        setSavedHover(openOnHover);
        setSavedKeepOpen(keepOpenOnNav);
        setSavedTooltips(showTooltips);

        // 🔥 Відправляємо сигнал для Sidebar, щоб він оновився миттєво
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
                            <span style={{ fontSize: '16px' }}>Відкривається при наведенні</span>
                        </label>
                        <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                checked={keepOpenOnNav} 
                                onChange={(e) => setKeepOpenOnNav(e.target.checked)} 
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '16px' }}>Не закривати при переході на іншу сторінку</span>
                        </label>
                        <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                checked={showTooltips} 
                                onChange={(e) => setShowTooltips(e.target.checked)} 
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '16px' }}>Показувати підказки при наведенні</span>
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
    const {mode, setMode} = useContext(AppContext)
    // 1. Инициализируем сохраненные данные из localStorage
    const [savedColor, setSavedColor] = useState(() => localStorage.getItem('color') || THEME_COLORS[0]);

    // 2. Текущие данные (то, что юзер просто "клацает")
    const [currentColor, setCurrentColor] = useState(savedColor);

    // 3. ПРИМЕНЯЕМ ЦВЕТ: Только когда изменился именно СОХРАНЕННЫЙ цвет (при загрузке или после handleSave)
    useEffect(() => {
        document.documentElement.style.setProperty('--color-main', savedColor);
        // Если у тебя тема меняет классы на body, можно добавить и это:
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
                            <span>Темная</span>
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
                            <span>Светлая</span>
                        </label>
                    </div>
                </div>

                <div className={styles.themeSettingsPart}>
                    <div className={styles.title}>Основний колір</div>
                    {/* Передаем currentColor, чтобы кружочки подсвечивались при клике, 
                        но глобально цвет поменяется только после Save */}
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
    '#ac1616', '#FE9E52', '#f6ca46', '#8eea38', '#42e3d5',
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

    // Стейт для файлів (що ми відправимо на бекенд)
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    // Стейт для прев'ю (що ми покажемо на екрані)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Рефи для прихованих інпутів
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
                    setHasChanges(false); // Скидаємо прапорець змін після завантаження
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            }
        };
        fetchProfile();
    }, []);

    // Обробка вибору аватарки
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file)); // Локальне прев'ю
            setHasChanges(true);
        }
    };

    // Обробка вибору банера
    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file)); // Локальне прев'ю
            setHasChanges(true);
        }
    };

    // Слідкуємо за описом
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
        setHasChanges(true);
    };

    // 2. Зберігаємо зміни
    const handleSaveProfile = async () => {
        if (!hasChanges || loading) return;
        setLoading(true);

        const formData = new FormData();

        // Додаємо опис (якщо він є, навіть порожній рядок)
        formData.append("description", description);

        // Додаємо файли тільки якщо користувач обрав нові
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
                setAvatarFile(null); // Очищаємо, бо воно вже на бекенді
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
            {/* Смена Аватара */}
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
                        style={{ display: 'none' }} // Ховаємо стандартний інпут
                        accept="image/*"
                        onChange={handleAvatarChange}
                    />
                </div>
            </div>
            {/* Смена Баннера */}
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
                        style={{ display: 'none' }} // Ховаємо стандартний інпут
                        accept="image/*"
                        onChange={handleBannerChange}
                    />
                </div>
            </div>

            {/* Смена Описания */}
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

            {/* Кнопка сохранить */}
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