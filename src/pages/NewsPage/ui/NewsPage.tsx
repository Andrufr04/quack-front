import styles from "./NewsPage.module.css"
import { useState, useEffect } from "react";
import { apiRequest } from "../../../shared/api/api";

interface NewsItem {
    id: string;
    title: string;
    text: string;
    image?: string;
    created_at: string;
    is_read: boolean;
}

export default function NewsPage() {
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [news, setNews] = useState<NewsItem[]>([]);

    const loadNews = async () => {
        const res = await apiRequest('/education/news/student/');
        if (res?.ok) {
            const data: NewsItem[] = await res.json();
            setNews(data);

            // 🔥 РОЗУМНЕ ОНОВЛЕННЯ МОДАЛКИ 🔥
            // Якщо у юзера зараз відкрита новина, ми перевіряємо, чи не змінилась вона
            setSelectedNews(prevSelected => {
                if (!prevSelected) return null;

                // Шукаємо цю ж новину в нових даних
                const updatedItem = data.find(n => n.id === prevSelected.id);

                // Якщо знайшли - оновлюємо текст/заголовок. Якщо ні (видалили) - закриваємо модалку (return null)
                return updatedItem || null;
            });
        }
    };

    useEffect(() => {
        // Завантажуємо дані при першому відкритті сторінки
        loadNews();

        // 🔥 2. Слухаємо вебсокет (миттєве оновлення при створенні нової новини)
        const handleNewNotification = () => loadNews();
        window.addEventListener('new_notification', handleNewNotification);

        // 🔥 3. Тихе фонове оновлення кожні 30 секунд (щоб бачити редагування/видалення)
        const intervalId = setInterval(loadNews, 30000);

        // Очищаємо підписки, коли юзер йде зі сторінки новин
        return () => {
            window.removeEventListener('new_notification', handleNewNotification);
            clearInterval(intervalId);
        };
    }, []);

    const handleOpenNews = async (item: NewsItem) => {
        setSelectedNews(item);

        if (!item.is_read) {
            setNews(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
            await apiRequest(`/education/news/${item.id}/read/`, { method: 'POST' });
        }
    };

    return (
        <>
            <title>Quack | Новини</title>
            <div className={styles.newsContainer}>
                <div className={styles.masonryGrid}>
                    {news.map((item) => (
                        <div
                            key={item.id}
                            className={styles.newsCard}
                            onClick={() => handleOpenNews(item)}
                            style={{
                                border: item.is_read ? 'none' : '2px solid var(--color-main)'
                            }}
                        >
                            {item.image && (
                                <img src={item.image} alt="" className={styles.cardImg} />
                            )}
                            <div className={styles.cardContent}>
                                <span className={styles.date}>
                                    {new Date(item.created_at).toLocaleDateString()}
                                </span>
                                <h2 className={styles.title}>{item.title}</h2>
                                <p className={styles.text}>{item.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedNews && (
                    <div className={styles.modalOverlay} onClick={() => setSelectedNews(null)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            {selectedNews.image && <img src={selectedNews.image} className={styles.modalImg} />}
                            <div className={styles.modalBody}>
                                <span className={styles.date}>{new Date(selectedNews.created_at).toLocaleString()}</span>
                                <h1>{selectedNews.title}</h1>
                                <p className={styles.modalText}>{selectedNews.text}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}