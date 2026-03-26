import { useState, useEffect, useRef, useMemo } from "react";
import styles from "./NotificationSidebar.module.css";
import { apiRequest } from "../../../api/api";
import { SVG_PLUS } from "../../icons/icons";

export type NotificationItem = {
    id: string;
    title: string;
    message: string;
    category: 'education' | 'social';
    is_read: boolean;
    created_at: string;
};

export default function NotificationSidebar({ onClose }: { onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<'education' | 'social'>('education');
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    
    // Стейт для пагінації
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const sortedNotifications = useMemo(() => {
        return [...notifications].sort((a, b) => {
            // 1. Спочатку порівнюємо статус прочитано/непрочитано
            if (a.is_read !== b.is_read) {
                return a.is_read ? 1 : -1; // Непрочитані (-1) йдуть вгору
            }
            // 2. Якщо статус однаковий, сортуємо за часом (останні зверху)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }, [notifications]);

    // Функція завантаження з бекенду
    const fetchNotifications = async (pageNum: number, category: string) => {
        if (loading) return;
        setLoading(true);

        try {
            const res = await apiRequest(`/notifications/?category=${category}&page=${pageNum}`);
            if (res?.ok) {
                const data = await res.json();
                
                // Якщо це перша сторінка - перезаписуємо, якщо наступна - додаємо до існуючих
                if (pageNum === 1) {
                    setNotifications(data.results);
                } else {
                    setNotifications(prev => [...prev, ...data.results]);
                }
                
                // Перевіряємо, чи є ще сторінки (якщо next не null)
                setHasMore(data.next !== null);
            }
        } catch (e) {
            console.error("Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    };

    // 1. Коли юзер змінює вкладку - скидаємо все і вантажимо 1 сторінку
    useEffect(() => {
        setNotifications([]);
        setPage(1);
        setHasMore(true);
        setExpandedId(null);
        fetchNotifications(1, activeTab);
    }, [activeTab]);

    // 2. Відстежуємо скрол донизу (Infinite Scroll)
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        
        // Якщо докрутили майже до кінця (залишилось менше 50px)
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (!loading && hasMore) {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchNotifications(nextPage, activeTab);
            }
        }
    };

    const handleNotificationClick = async (id: string) => {
        if (expandedId === id) {
            setExpandedId(null);
            return;
        }

        setExpandedId(id);

        const targetNotif = notifications.find(n => n.id === id);
        if (targetNotif && !targetNotif.is_read) {
            // Оновлюємо UI миттєво
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            // Відправляємо запит на бекенд, щоб позначити як прочитане
            await apiRequest(`/notifications/${id}/read/`, { method: 'POST' });
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
    };

    return (
        <>
            <div className={styles.overlay} onClick={onClose}></div>

            <div className={styles.Sidebar}>
                <div className={styles.header}>
                    <div className={styles.icon} onClick={onClose}>{SVG_PLUS}</div>
                    <div className={styles.title}>Сповіщення</div>
                </div>

                <div className={styles.tabs}>
                    <div 
                        className={`${styles.tab} ${activeTab === 'education' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('education')}
                    >
                        Навчання
                    </div>
                    <div 
                        className={`${styles.tab} ${activeTab === 'social' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('social')}
                    >
                        Соціальне
                    </div>
                </div>

                {/* 🔥 Додали onScroll на контейнер зі списком */}
                <div className={styles.notificationList} onScroll={handleScroll}>
                    {sortedNotifications.length === 0 && !loading ? (
                        <div className={styles.emptyMsg}>Немає сповіщень у цій категорії</div>
                    ) : (
                        sortedNotifications.map(n => { // 🔥 Тут змінили на sortedNotifications
                            const isExpanded = expandedId === n.id;
                            return (
                                <div 
                                    key={n.id} 
                                    className={`${styles.notificationCard} ${!n.is_read ? styles.unread : ''} ${isExpanded ? styles.expanded : ''}`}
                                    onClick={() => handleNotificationClick(n.id)}
                                >
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardTitle}>{n.title}</div>
                                        <div className={styles.cardTime}>{formatTime(n.created_at)}</div>
                                    </div>
                                    
                                    <div className={styles.cardMessage}>
                                        {n.message}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    
                    {/* Показуємо лоадер під час підвантаження */}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '10px' }}>
                            <img src="/gifs/loading.svg" alt="loading" style={{ width: 30, height: 30 }} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}