import { useContext, useEffect, useRef, useState } from "react"
import { SVG_ADDREACTION, SVG_CLIP, SVG_COMMENT, SVG_PLUS, SVG_SEND, SVG_SHARE } from "../../../shared/ui/icons/icons"
import RoundButton from "../../../shared/ui/RoundButton/RoundButton"
import styles from "./ProfilePage.module.css"
import { apiRequest } from "../../../shared/api/api";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AppContext } from "../../../app/providers/AppProvider/model/AppContext";

interface Post {
    id: string;
    title: string | null;
    text: string | null;
    images: string[]; // 🔥 Змінили на масив
    created_at: string;
    reactions: Record<string, number>;
    my_reaction: string | null;
}

interface ProfileData {
    id: string;
    name: string;
    surname: string;
    description: string;
    profile_picture: string | null;
    banner_picture: string | null;
}

export default function ProfilePage() {
    const { id } = useParams<{ id: string }>(); // Дістаємо ID з URL
    const { mode } = useContext(AppContext)
    const isOwnProfile = !id; // Якщо ID немає — це мій профіль
    const [profile, setProfile] = useState<ProfileData | null>(null)

    const [expanded, setExpanded] = useState(false)
    const [isLongText, setIsLongText] = useState(true); // По умолчанию true, чтобы первично повесить классы
    const textRef = useRef<HTMLDivElement>(null);

    // --- Логика для ПОСТА (10 строк + градиент) ---
    const [postExpanded, setPostExpanded] = useState(false);
    const [isPostLong, setIsPostLong] = useState(false);
    const postRef = useRef<HTMLDivElement>(null);

    const [posts, setPosts] = useState<Post[]>([]); // Стейт для постів
    const [newPostText, setNewPostText] = useState("");
    const [postFiles, setPostFiles] = useState<File[]>([]);
    const postFileInputRef = useRef<HTMLInputElement>(null);

    // 🔥 НОВЕ: Реф для скидання висоти textarea
    const textareaRef = useRef<HTMLTextAreaElement>(null); 

    // 🔥 НОВЕ: Стейт для кешування URL картинок, щоб не блимали
    const [filePreviews, setFilePreviews] = useState<string[]>([]);

    const [showReactions, setShowReactions] = useState(false);
    const [activeReactionPopup, setActiveReactionPopup] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null)
    const token = localStorage.getItem('access_token')

    useEffect(() => {
        if (!token) return

        const fetchData = async () => {
            try {
                const profileEndpoint = isOwnProfile ? '/profiles/my/' : `/profiles/${id}/`;
                const profRes = await apiRequest(profileEndpoint);
                if (profRes?.ok) {
                    const profData = await profRes.json();
                    setProfile(profData);

                    // Додана перевірка: робимо запит тільки якщо є ID
                    if (profData.id) {
                        const postsRes = await apiRequest(`/profiles/posts/user/${profData.id}/`);
                        if (postsRes?.ok) {
                            const postsData = await postsRes.json();
                            setPosts(postsData);
                        }
                    } else {
                        console.error("Бекенд не повернув ID профілю!");
                    }
                }
                else {
                    toast.error("Помилка при завантаженні профілю!")
                }
            } catch (err) {
                console.error("Failed to load profile", err)
            }
        };
        fetchData()
    }, [token, id, isOwnProfile])

    useEffect(() => {
        // Створюємо URL тільки для нових файлів
        const urls = postFiles.map(file => URL.createObjectURL(file));
        setFilePreviews(urls);

        // Очищаємо пам'ять браузера при видаленні компонента або зміні файлів
        return () => {
            urls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [postFiles]);

    // Створення поста
    const handleCreatePost = async () => {
        if (!newPostText && postFiles.length === 0) return;

        const formData = new FormData();
        formData.append('text', newPostText);
        // Якщо бекенд підтримує декілька фото, додаємо в циклі
        postFiles.forEach(file => formData.append('image', file));

        try {
            const res = await apiRequest('/profiles/posts/create/', {
                method: 'POST',
                body: formData
            });
            if (res?.ok) {
                setNewPostText("");
                setPostFiles([]);
                toast.success("Опубліковано!");

                // 🔥 ТЕПЕР БЕЗ ПЕРЕЗАВАНТАЖЕННЯ 🔥
                // Просто тихо підтягуємо оновлений список постів
                if (profile?.id) {
                    const postsRes = await apiRequest(`/profiles/posts/user/${profile.id}/`);
                    if (postsRes?.ok) {
                        const postsData = await postsRes.json();
                        setPosts(postsData);
                    }
                }
            } else {
                toast.error("Помилка при публікації")
            }
        } catch (e) {
            toast.error("Помилка при публікації");
        }
    };

    // Робота з реакціями
    const handleReaction = async (postId: string, emoji: string) => {
        try {
            const res = await apiRequest(`/profiles/posts/${postId}/react/`, {
                method: 'POST',
                body: JSON.stringify({ emoji })
            });
            if (res?.ok) {
                // Оновлюємо пости локально для миттєвого ефекту
                const updatedPosts = await apiRequest(`/profiles/posts/user/${profile?.id}/`).then(r => r?.json());
                setPosts(updatedPosts);
            }
        } catch (e) {
            console.error(e);
        }
    };

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
            if (response.ok) {
                const updatedData = await response.json()
                toast.success("Фото профіля завантажено")
                setProfile(prev => {
                    if (!prev) return null
                    return {
                        ...prev,
                        profile_picture: getAvatarUrl(updatedData.profile_picture)
                    }
                })
            } else {
                toast.error("Помилка при завантаженні фото профіля!")
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
        // Якщо у профілі є банер — беремо його. Якщо ні — ставимо стандартну картинку.
        // Використовуємо getAvatarUrl, щоб правильно сформувати посилання.
        const bannerUrl = profile?.banner_picture 
            ? getAvatarUrl(profile.banner_picture) 
            : mode === "dark" ? "/images/bg-dark-mode.PNG" : "/images/bg-light-mode.PNG";

        // Накладаємо лінійний градієнт поверх картинки
        const gradientAndImage = `linear-gradient(360deg, var(--color-bg) 33.78%, rgba(255, 255, 255, 0) 75.49%), url("${bannerUrl}")`;

        document.documentElement.style.setProperty('--bg-img', gradientAndImage);

        return () => {
            document.documentElement.style.removeProperty('--bg-img');
        };
    }, [profile?.banner_picture]); // 🔥 Важливо: додали залежність!

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
    //const photos = [1, 2, 3, 4, 5];

    const emojis = ['👍', '🔥', '❤️', '😂', '🤯'];

    return (
        <div className={styles.profile}>
            <title>Quack | Профіль</title>

            {isOwnProfile && <><div className={styles.newPostGradient}></div>
            <div className={styles.newPostContainer}>
                <div className={styles.attachments}>
                    {postFiles.map((f, i) => (
                        <div key={i} className={styles.attachedImg} style={{ backgroundImage: `url(${URL.createObjectURL(f)})`, backgroundSize: 'cover' }}>
                            <div className={styles.deleteImg} onClick={() => setPostFiles(prev => prev.filter((_, idx) => idx !== i))}>
                                {SVG_PLUS}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles.inputContainer}>
                    <div className={styles.inputIcon} onClick={() => postFileInputRef.current?.click()}>
                        {SVG_CLIP}
                    </div>
                    <input
                        type="file"
                        multiple
                        hidden
                        ref={postFileInputRef}
                        accept="image/*"
                        onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            const limit = 10 * 1024 * 1024; // 10 МБ
                            
                            // Фільтруємо файли
                            const validFiles = files.filter(file => {
                                if (!file.type.startsWith('image/')) {
                                    toast.error(`Файл ${file.name} не є зображенням.`);
                                    return false;
                                }
                                if (file.size > limit) {
                                    toast.error(`Файл ${file.name} завеликий (макс 10 МБ).`);
                                    return false;
                                }
                                return true;
                            });

                            // Беремо тільки перші 5 ВАЛІДНИХ файлів
                            // (якщо вже є завантажені, додаємо нові до існуючих, але не більше 5 загалом)
                            setPostFiles(prev => {
                                const combined = [...prev, ...validFiles];
                                if (combined.length > 5) {
                                    toast.error("Можна додати максимум 5 фото.");
                                }
                                return combined.slice(0, 5);
                            });

                            // Скидаємо value інпута, щоб можна було вибрати той самий файл ще раз, якщо треба
                            if (postFileInputRef.current) {
                                postFileInputRef.current.value = '';
                            }
                        }}
                    />
                    <textarea
                        className={styles.input}
                        placeholder="Створити нову публікацію"
                        value={newPostText}
                        maxLength={4096} // 🔥 Жорсткий ліміт HTML
                        onChange={(e) => {
                            const val = e.target.value;
                            // 🔥 Валідація на кількість переносів (не більше 100)
                            const lineBreaks = (val.match(/\n/g) || []).length;
                            
                            if (lineBreaks <= 100) {
                                setNewPostText(val);
                            } else {
                                toast.error("Досягнуто ліміт переносів рядка (100).");
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault(); 
                                handleCreatePost();
                            }
                        }}
                        rows={1}
                        style={{
                            resize: 'none', 
                            maxHeight: "200px",
                            overflow: 'auto', 
                        }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                    />
                    <div className={styles.inputIcon} onClick={handleCreatePost}>{SVG_SEND}</div>
                </div>
            </div>
            </>}

            <div className={styles.info}>
                <div>
                    {isOwnProfile && <>
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
                    </>}

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
                            <span className={styles.showMore} onClick={() => setExpanded(true)}>... Показати більше</span>
                        )}

                        {profile?.description}
                    </div>
                </div>
            </div>

            <div className={styles.posts}>
                {posts.map(post => (
                    <PostItem
                        key={post.id}
                        post={post}
                        profile={profile}
                        getAvatarUrl={getAvatarUrl}
                        handleReaction={handleReaction}
                        activeReactionPopup={activeReactionPopup}
                        setActiveReactionPopup={setActiveReactionPopup}
                        emojis={emojis}
                    />
                ))}
                <div className={styles.block}></div>
            </div>
        </div>
    )
}

// Додай це вище або нижче ProfilePage компонента

function PostItem({ post, profile, getAvatarUrl, handleReaction, activeReactionPopup, setActiveReactionPopup, emojis }: any) {
    const postRef = useRef<HTMLDivElement>(null);
    const [isPostLong, setIsPostLong] = useState(false);
    const [postExpanded, setPostExpanded] = useState(false);

    const totalReactionsCount = Object.values(post.reactions).reduce((acc: number, val: any) => acc + val, 0) as number;

    useEffect(() => {
        const checkPostLength = () => {
            if (postRef.current) {
                const computedStyle = window.getComputedStyle(postRef.current);
                const lineHeight = parseFloat(computedStyle.lineHeight) || 24; // Дефолтне значення, якщо не змогло прочитати

                // Перевіряємо, чи текст більше 10 рядків
                if (postRef.current.scrollHeight > lineHeight * 10.5) {
                    setIsPostLong(true);
                } else {
                    setIsPostLong(false);
                }
            }
        };

        // Даємо час браузеру відрендерити текст (бо він приходить з бекенду)
        setTimeout(checkPostLength, 50);

        window.addEventListener('resize', checkPostLength);
        return () => window.removeEventListener('resize', checkPostLength);
    }, [post.text]); // 🔥 Важливо: перевіряємо, коли змінюється текст поста

    const getLayoutClass = (count: number) => {
        if (count === 1) return styles.layout1;
        if (count === 2) return styles.layout2;
        if (count === 3) return styles.layout3;
        if (count === 4) return styles.layout4;
        return styles.layout5; // Для 5 и более фото
    };

    return (
        <div className={styles.postContainer}>
            <div className={styles.post}>
                <div className={styles.postHeader}>
                    <div className={styles.postProfileImg} style={{ backgroundImage: `url(${getAvatarUrl(profile?.profile_picture || null)})` }}></div>
                    <div className={styles.postName}>{profile?.name} {profile?.surname}</div>
                </div>

                {post.title && <div className={styles.title}>{post.title}</div>}

                {post.images && post.images.length > 0 && (
                    <div className={`${styles.postImgs} ${getLayoutClass(post.images.length)}`}>
                        {post.images.map((imgUrl: string, index: number) => (
                            <div
                                key={index}
                                className={styles.imgPlaceholder}
                                style={{ backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover' }}
                            ></div>
                        ))}
                    </div>
                )}

                <div className={styles.postTextWrapper}>
                    <div
                        ref={postRef}
                        className={`${styles.text} ${isPostLong && !postExpanded ? styles.postCollapsed : styles.postExpanded}`}
                    >
                        {isPostLong && !postExpanded && (
                            <span
                                className={styles.showMore}
                                onClick={() => setPostExpanded(true)}
                            >
                                ... Показати більше
                            </span>
                        )}
                        {post.text}
                    </div>
                </div>
            </div>

            <div className={styles.postFooter}>
                <div className={styles.reactionsContainer}>
                    {Object.entries(post.reactions).map(([emoji, count]: any) => (
                        count > 0 && (
                            <div key={emoji} onClick={() => handleReaction(post.id, emoji)} className={`${styles.reaction} ${post.my_reaction === emoji ? styles.activeReaction : ''}`}>
                                <div className={styles.emoji} >{emoji}</div>
                                <div>{count}</div>
                            </div>
                        )
                    ))}
                </div>

                <div className={styles.postActions}>
                    <div className={styles.postActionIcons}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {activeReactionPopup === post.id && (
                                <div className={styles.reactionPopup}>
                                    {emojis.map((emoji: string) => (
                                        <div
                                            key={emoji}
                                            className={styles.reactionCircle}
                                            onClick={() => {
                                                handleReaction(post.id, emoji);
                                                setActiveReactionPopup(null);
                                            }}
                                        >
                                            {emoji}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div
                                className={styles.postActionIcon}
                                onClick={() => setActiveReactionPopup(activeReactionPopup === post.id ? null : post.id)}
                                // 🔥 Фарбуємо в колір бренду, якщо є своя реакція
                                style={{ color: post.my_reaction ? 'var(--color-main)' : 'inherit' }}
                            >
                                {SVG_ADDREACTION}
                            </div>
                            {/* 🔥 Виводимо загальну цифру, якщо вона є */}
                            {totalReactionsCount > 0 && (
                                <div style={{
                                    color: 'inherit',
                                    fontSize: '14px',
                                    marginBottom: '3px'
                                }}>
                                    {totalReactionsCount}
                                </div>
                            )}
                        </div>
                        <div className={styles.postActionIcon} style={{ marginLeft: ".3em", marginBottom: ".2em" }}>{SVG_COMMENT}</div>
                    </div>
                    <div className={styles.postActionIcon}>{SVG_SHARE}</div>
                </div>
            </div>
        </div>
    );
}