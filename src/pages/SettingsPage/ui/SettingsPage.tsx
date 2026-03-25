import { SVG_PLUS } from "../../../shared/ui/icons/icons";
import styles from "./SettingsPage.module.css"
import { useState, useEffect } from "react";

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
                    {activeTab === 'interface' && <div>Тут будут настройки интерфейса</div>}
                    {activeTab === 'profile' && <ProfileSettings />}
                </div>
            </div>
        </div>
    );
}

function ThemeSettings() {
    // 1. Инициализируем сохраненные данные из localStorage
    const [savedTheme, setSavedTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [savedColor, setSavedColor] = useState(() => localStorage.getItem('color') || THEME_COLORS[0]);

    // 2. Текущие данные (то, что юзер просто "клацает")
    const [currentTheme, setCurrentTheme] = useState(savedTheme);
    const [currentColor, setCurrentColor] = useState(savedColor);

    // 3. ПРИМЕНЯЕМ ЦВЕТ: Только когда изменился именно СОХРАНЕННЫЙ цвет (при загрузке или после handleSave)
    useEffect(() => {
        document.documentElement.style.setProperty('--color-main', savedColor);
        // Если у тебя тема меняет классы на body, можно добавить и это:
        document.body.setAttribute('data-theme', savedTheme);
    }, [savedColor, savedTheme]); 

    const hasChanges = currentTheme !== savedTheme || currentColor !== savedColor;

    const handleSave = () => {
        localStorage.setItem('theme', currentTheme);
        localStorage.setItem('color', currentColor);

        // КРИТИЧЕСКИЙ МОМЕНТ: Обновляем сохраненные стейты
        setSavedTheme(currentTheme);
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
                                checked={currentTheme === 'dark'}
                                onChange={() => setCurrentTheme('dark')}
                                className={styles.radioInput}
                            />
                            <span>Темная</span>
                        </label>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="theme"
                                value="light"
                                checked={currentTheme === 'light'}
                                onChange={() => setCurrentTheme('light')}
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
    '#d42b2b', '#ec8735', '#EAB308', '#68c214', '#00a6c3',
    '#1317d5', '#501dc8', '#b920d0', '#cd1c57', '#64748B'
];
// Теперь ColorGrid просто получает цвет и функцию его изменения от родителя
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

    return (
        <div className={styles.profileSettings}>
            {/* Смена Аватара */}
            <div className={styles.settingItem}>
                <div className={styles.title}>Фото профілю</div>
                <div className={styles.avatarUpload}>
                    <div className={styles.avatarPreview}>
                        <div className={styles.uploadIcon}>{SVG_PLUS}</div>
                    </div>
                    <input type="file" className={styles.fileInput} accept="image/*" />
                </div>
            </div>
            {/* Смена Баннера */}
            <div className={styles.settingItem}>
                <div className={styles.title}>Банер профілю</div>
                <div className={styles.bannerUpload}>
                    <div className={styles.bannerPreview}>
                        <div className={styles.uploadIcon}>{SVG_PLUS}</div>
                    </div>
                    <input type="file" className={styles.fileInput} accept="image/*" />
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
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    {/* Счетчик символов */}
                    <div className={styles.charCounter}>
                        {description.length}/{maxChars}
                    </div>
                </div>
            </div>

            {/* Кнопка сохранить */}
            <div className={styles.containerSave}>
                <div className={styles.saveContainer}>
                    <button className={styles.saveBtn}>
                        Зберегти зміни
                    </button>
                </div>
            </div>
        </div>
    );
}