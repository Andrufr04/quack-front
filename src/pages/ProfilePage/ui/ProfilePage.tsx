import { useEffect, useRef, useState } from "react"
import { SVG_ADDREACTION, SVG_CLIP, SVG_COMMENT, SVG_PLUS, SVG_SEND, SVG_SHARE } from "../../../shared/ui/icons/icons"
import RoundButton from "../../../shared/ui/RoundButton/RoundButton"
import styles from "./ProfilePage.module.css"
import { apiRequest } from "../../../shared/api/api";

interface ProfileData {
    name: string;
    surname: string;
    description: string;
    profile_picture: string | null;
}

export default function ProfilePage() {
    const [expanded, setExpanded] = useState(false)
    const [profile, setProfile] = useState<ProfileData | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const token = localStorage.getItem('access_token')

    useEffect(() => {

        if (!token) {
            return
        }

        const fetchProfile = async () => {
            try {
                const response = await apiRequest('/profiles/my/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response) return
                if (response.ok) {
                    const data = await response.json()
                    setProfile(data)
                }
            } catch (err) {
                console.error("Failed to load profile", err)
            }
        };
        fetchProfile()
    }, [token])

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            event.target.value = "";
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5 MB
        if (file.size > maxSize) {
            event.target.value = "";
            return;
        }

        const formData = new FormData()
        formData.append('profile_picture', file)

        try {
            const response = await apiRequest('/profiles/my/', {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            })
            if (!response) return
            if (response.ok) {
                const updatedData = await response.json()
                setProfile(prev => {
                    if (!prev) return null
                    return {
                        ...prev,
                        profile_picture: getAvatarUrl(updatedData.profile_picture)
                    }
                })
            } else {
                //const errorData = await response.json();
                //console.log(`Помилка: ${errorData.error || "Не вдалося завантажити"}`);
                //TODO: Error
            }
        } catch (err) {
            console.error("Upload failed", err)
        }
    };

    const getAvatarUrl = (path: string | null) => {
        if (!path) return '/images/no-image.png'
        if (path.startsWith('http')) {
            try {
                const url = new URL(path)
                return url.pathname
            } catch (e) {
                return path
            }
        }
        return path
    };

    const [isLongText, setIsLongText] = useState(true); // По умолчанию true, чтобы первично повесить классы
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkTextLength = () => {
            if (textRef.current) {
                // Вытаскиваем высоту одной строки из CSS (наш line-height)
                const computedStyle = window.getComputedStyle(textRef.current);
                const lineHeight = parseFloat(computedStyle.lineHeight);

                // Если полная высота текста (scrollHeight) больше высоты двух строк
                // (умножаем на 2.1, чтобы дать небольшой запас на погрешность отрисовки браузера)
                if (textRef.current.scrollHeight > lineHeight * 2.1) {
                    setIsLongText(true);
                } else {
                    setIsLongText(false);
                }
            }
        };

        checkTextLength();

        // Опционально: пересчитываем при ресайзе экрана (например, если перевернули телефон)
        window.addEventListener('resize', checkTextLength);
        return () => window.removeEventListener('resize', checkTextLength);
    }, [profile?.description]); // Пересчитываем, если текст изменился

    useEffect(() => {
        // Накладываем линейный градиент поверх картинки.
        // rgba(255, 255, 255, 0) - полностью прозрачный белый
        // rgba(255, 255, 255, 1) - плотный белый
        const gradientAndImage = `linear-gradient(360deg, var(--color-bg) 33.78%, rgba(255, 255, 255, 0) 75.49%), url("/images/bg-dark-mode.PNG")`;

        document.documentElement.style.setProperty('--bg-img', gradientAndImage);

        return () => {
            document.documentElement.style.removeProperty('--bg-img');
        };
    }, []);

    // --- Логика для ПОСТА (10 строк + градиент) ---
    const [postExpanded, setPostExpanded] = useState(false);
    const [isPostLong, setIsPostLong] = useState(false);
    const postRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkPostLength = () => {
            if (postRef.current) {
                // Вытаскиваем высоту одной строки из CSS
                const computedStyle = window.getComputedStyle(postRef.current);
                const lineHeight = parseFloat(computedStyle.lineHeight);

                // Умножаем на 10.5, чтобы проверить лимит в 10 строк
                if (postRef.current.scrollHeight > lineHeight * 10.5) {
                    setIsPostLong(true);
                } else {
                    setIsPostLong(false);
                }
            }
        };

        // Небольшая задержка (setTimeout) нужна, чтобы React успел вставить текст в DOM до замера
        setTimeout(checkPostLength, 0);

        window.addEventListener('resize', checkPostLength);
        return () => window.removeEventListener('resize', checkPostLength);
    }, []); // Если текст поста будет приходить с бэкенда, добавь его переменную сюда в массив

    // Попробуй менять количество элементов в массиве от 1 до 5
    const photos = [1, 2, 3, 4, 5];

    // Функция для безопасного определения класса (если фоток больше 5, применяем сетку для 5)
    const getLayoutClass = (count: number) => {
        if (count === 1) return styles.layout1;
        if (count === 2) return styles.layout2;
        if (count === 3) return styles.layout3;
        if (count === 4) return styles.layout4;
        return styles.layout5; // Для 5 и более фото
    };

    const [showReactions, setShowReactions] = useState(false);

    return (
        <div className={styles.profile}>
            <title>Quack | Профіль</title>

            <div className={styles.newPostGradient}></div>
            <div className={styles.newPostContainer}>
                {/* <div className={styles.attachedImg}>
                    <div className={styles.deleteImg}>{SVG_PLUS}</div>
                </div> */}
                <div className={styles.inputContainer}>
                    <div className={styles.inputIcon}>{SVG_CLIP}</div>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Створити нову публікацію"
                    />
                    <div className={styles.inputIcon}>{SVG_SEND}</div>
                </div>
            </div>

            <div className={styles.info}>
                <div>
                    <div className={styles.iconPlus} onClick={handleUploadClick}>
                        <RoundButton button={{ icon: SVG_PLUS, text: "Додати картинку профілю" }} />
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept="image/*"
                    />

                    <div className={styles.profileImg} style={{
                        backgroundImage: `url(${profile ? getAvatarUrl(profile.profile_picture) : "/images/no-image.png"})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}></div>
                </div>

                <div className={styles.name}>{profile ? profile.name : "Ім'я"}</div>

                <div className={styles.descriptionWrapper}>
                    <div
                        ref={textRef}
                        className={`${styles.text} ${isLongText && !expanded ? styles.collapsed : styles.expanded}`}
                    >
                        {isLongText && !expanded && (
                            <span
                                className={styles.showMore}
                                onClick={() => setExpanded(true)}
                            >
                                ... Показати більше
                            </span>
                        )}

                        {profile?.description}
                    </div>
                </div>
            </div>

            <div className={styles.posts}>
                <div className={styles.postContainer}>
                    <div className={styles.post}>
                        <div className={styles.postHeader}>
                            <div className={styles.postProfileImg} style={{
                                backgroundImage: `url(${profile ? getAvatarUrl(profile.profile_picture) : "/images/no-image.png"})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}></div>
                            <div className={styles.postName}>{profile ? profile.name : "Ім'я"}</div>
                        </div>

                        <div className={styles.title}>Заголовок поста</div>

                        {/* БЛОК С ГАЛЕРЕЕЙ */}
                        {photos.length > 0 && (
                            <div className={`${styles.postImgs} ${getLayoutClass(photos.length)}`}>
                                {photos.slice(0, 5).map((photo, index) => (
                                    <div key={index} className={styles.imgPlaceholder}>
                                        {photo}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={styles.postTextWrapper}>
                            <div
                                ref={postRef}
                                className={`${styles.text} ${isPostLong && !postExpanded ? styles.postCollapsed : styles.postExpanded}`}
                            >
                                {/* КНОПКА ДОЛЖНА БЫТЬ ЗДЕСЬ, ВНУТРИ ТЕКСТОВОГО БЛОКА, ПЕРЕД ТЕКСТОМ! */}
                                {isPostLong && !postExpanded && (
                                    <span
                                        className={styles.showMore}
                                        onClick={() => setPostExpanded(true)}
                                    >
                                        ... Показати більше
                                    </span>
                                )}

                                {/* А ДАЛЬШЕ УЖЕ ИДЕТ САМ ТЕКСТ */}
                                Как автор блога я слежу за письмами с хорошим копирайтингом и другими текстами компаний.
                                Стараюсь обращать внимание на интересные детали, удачные приемы, чтобы использовать их в своей работе.
                                В этой статье поделюсь любимыми текстами и расскажу, какие детали в них меня вдохновляют.
                                Ремарка: я считаю, что крутой копирайтинг — это тот, который выполняет свою задачу.
                                То есть делает так, чтобы подписчики читали письма, переходили по ссылкам и покупали продукты компании.
                                При этом тексты могут быть самыми обычными.
                                Поэтому свою подборку я назову так: примеры текстов, которые выделяются на фоне других и вдохновляют меня в работе.
                                Еще немного текста чтобы точно добить до 10 строк и увидеть эффект маски.
                                Как автор блога я слежу за письмами с хорошим копирайтингом и другими текстами компаний.
                                Стараюсь обращать внимание на интересные детали, удачные приемы, чтобы использовать их в своей работе.
                                В этой статье поделюсь любимыми текстами и расскажу, какие детали в них меня вдохновляют.
                                Ремарка: я считаю, что крутой копирайтинг — это тот, который выполняет свою задачу.
                                То есть делает так, чтобы подписчики читали письма, переходили по ссылкам и покупали продукты компании.
                                При этом тексты могут быть самыми обычными.
                                Поэтому свою подборку я назову так: примеры текстов, которые выделяются на фоне других и вдохновляют меня в работе.
                                Еще немного текста чтобы точно добить до 10 строк и увидеть эффект маски.
                            </div>
                        </div>
                    </div>
                    <div className={styles.postFooter}>
                        <div className={styles.reactionsContainer}>
                            <div className={styles.reaction}>
                                <div className={styles.emoji}>{SVG_PLUS}</div>
                                <div>100</div>
                            </div>
                            <div className={styles.reaction}>
                                <div className={styles.emoji}>{SVG_PLUS}</div>
                                <div>1000</div>
                            </div>
                        </div>
                        <div className={styles.postActions}>
                            <div className={styles.postActionIcons}>
                                <div className={styles.reasctions} style={{ position: 'relative' }}>
                                    {/* Само всплывающее окно */}
                                    {showReactions && (
                                        <div className={styles.reactionPopup}>
                                            {/* Рисуем 5 серых кружочков-заглушек */}
                                            {[1, 2, 3, 4, 5].map((item) => (
                                                <div key={item} className={styles.reactionCircle}></div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Кнопка, которая открывает/закрывает окно */}
                                    <div
                                        className={styles.postActionIcon}
                                        onClick={() => setShowReactions(!showReactions)}
                                    >
                                        {SVG_ADDREACTION}
                                    </div>
                                    <div>20</div>
                                </div>
                                <div className={styles.reasctions}>
                                    <div className={styles.postActionIcon}>{SVG_COMMENT}</div>
                                    <div>1</div>
                                </div>
                            </div>
                            <div className={styles.postActionIcon}>
                                {SVG_SHARE}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.block}></div>
            </div>
        </div>
    )
}