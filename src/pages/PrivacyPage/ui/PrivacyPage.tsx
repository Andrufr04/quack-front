import { useState } from "react";
import styles from "./PrivacyPage.module.css";
import { SVG_ARROW_DOWN } from "../../../shared/ui/icons/icons";
import { useNavigate } from "react-router-dom";

export default function PrivacyPage() {
    const [activeTab, setActiveTab] = useState('privacy');
    const navigate = useNavigate()

    return (
        <div className={styles.container}>
            <title>Quack | Документація</title>

            <div className={styles.settings}>
                {/* ЛІВЕ МЕНЮ (як у налаштуваннях) */}
                <div className={styles.tabs}>
                     
                    <div className={styles.sidebarTitle}>
                        <div className={styles.doneTop} onClick={() => navigate("/")}>
                            {SVG_ARROW_DOWN}
                        </div>
                        <div>Документація</div>
                    </div>

                    <div
                        className={`${styles.tab} ${activeTab === 'privacy' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('privacy')}
                    >
                        Політика конфіденційності
                    </div>
                    <div
                        className={`${styles.tab} ${activeTab === 'terms' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('terms')}
                    >
                        Умови використання
                    </div>
                    <div
                        className={`${styles.tab} ${activeTab === 'community' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('community')}
                    >
                        Правила спільноти
                    </div>

                    <div className={styles.contactInfo}>
                        Маєте запитання щодо даних? <br />
                        Зверніться до адміністрації закладу.
                    </div>
                </div>

                <div className={styles.line}></div>

                {/* ПРАВА ЧАСТИНА З КОНТЕНТОМ */}
                <div className={styles.options}>
                    {activeTab === 'privacy' && <PrivacyContent />}
                    {activeTab === 'terms' && <TermsContent />}
                    {activeTab === 'community' && <CommunityContent />}
                </div>
            </div>
        </div>
    );
}

// --- КОМПОНЕНТИ КОНТЕНТУ ДЛЯ ВЛАДОК ---

function PrivacyContent() {
    return (
        <div className={styles.documentContainer}>
            <div className={styles.header}>
                <h1>Політика конфіденційності</h1>
                <div className={styles.date}>Останнє оновлення: 7 квітня 2026 року</div>
            </div>

            <h2>1. Вступ</h2>
            <p>
                Вітаємо в електронному щоденнику <b>Quack</b>! Ми серйозно ставимося до безпеки ваших персональних даних.
                Ця Політика конфіденційності пояснює, яку інформацію ми збираємо, як ми її використовуємо та як захищаємо, коли ви користуєтеся нашою платформою.
            </p>

            <h2>2. Які дані ми збираємо</h2>
            <p>Для забезпечення повноцінного навчального процесу ми збираємо наступні категорії даних:</p>
            <ul>
                <li><b>Облікові дані:</b> Ваше ім'я, прізвище, по батькові, дата народження та електронна пошта.</li>
                <li><b>Освітня інформація:</b> Ваші оцінки, відвідуваність, виконані домашні завдання.</li>
                <li><b>Соціальна взаємодія:</b> Ваші коментарі, публікації, реакції (емодзі) та інформація з профілю.</li>
            </ul>

            <h2>3. Хто має доступ до ваших даних</h2>
            <p>
                <span>Ваші дані є конфіденційними. Доступ до оцінок та відвідуваності мають лише викладачі та адміністрація. </span>
                <b>Ми ніколи не продаємо і не передаємо ваші дані третім особам чи рекламодавцям.</b>
            </p>

            <h2>4. Ваші права</h2>
            <p>Ви маєте право:</p>
            <ul>
                <li>Переглядати, редагувати або видаляти інформацію у своєму профілі.</li>
                <li>Видаляти власні публікації та коментарі.</li>
                <li>Звертатися до адміністрації з проханням про видалення облікового запису.</li>
            </ul>
            <div className={styles.bottomSpace}></div>
        </div>
    );
}

function TermsContent() {
    return (
        <div className={styles.documentContainer}>
            <div className={styles.header}>
                <h1>Умови використання</h1>
                <div className={styles.date}>Останнє оновлення: 7 квітня 2026 року</div>
            </div>

            <h2>1. Загальні положення</h2>
            <p>
                Використовуючи платформу Quack, ви погоджуєтесь дотримуватись цих умов. Платформа призначена виключно для навчальних цілей, комунікації між студентами та викладачами, а також для відстеження академічної успішності.
            </p>

            <h2>2. Обов'язки користувачів</h2>
            <ul>
                <li>Використовувати платформу відповідно до її призначення.</li>
                <li>Не передавати дані для входу третім особам.</li>
                <li>Не завантажувати шкідливе програмне забезпечення або контент, що порушує авторські права.</li>
            </ul>

            <h2>3. Відповідальність</h2>
            <p>
                Адміністрація не несе відповідальності за тимчасові технічні збої, проте зобов'язується оперативно їх усувати.
            </p>
            <div className={styles.bottomSpace}></div>
        </div>
    );
}

function CommunityContent() {
    return (
        <div className={styles.documentContainer}>
            <div className={styles.header}>
                <h1>Правила спільноти</h1>
                <div className={styles.date}>Останнє оновлення: 7 квітня 2026 року</div>
            </div>

            <h2>1. Повага та толерантність</h2>
            <p>
                Quack - це простір для комфортного навчання. Будь-які прояви булінгу, дискримінації, образ або використання нецензурної лексики у постах чи коментарях суворо заборонені.
            </p>

            <h2>2. Публікації та контент</h2>
            <ul>
                <li>Публікуйте матеріали, що стосуються навчання, студентського життя або корисних ініціатив.</li>
                <li>Заборонено публікувати спам, рекламу або контент 18+.</li>
                <li>Поважайте авторські права: якщо ділитесь чужими матеріалами, залишайте посилання на джерело.</li>
            </ul>

            <h2>3. Наслідки порушень</h2>
            <p>
                У разі порушення правил спільноти адміністрація залишає за собою право видаляти неприйнятний контент та тимчасово або назавжди блокувати доступ до соціальних функцій профілю.
            </p>
            <div className={styles.bottomSpace}></div>
        </div>
    );
}