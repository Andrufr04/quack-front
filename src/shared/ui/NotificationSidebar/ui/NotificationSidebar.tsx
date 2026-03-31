import { useState, useEffect, useMemo } from "react";
import styles from "./NotificationSidebar.module.css";
import { apiRequest } from "../../../api/api"; // Перевір шлях
import { SVG_PLUS } from "../../icons/icons";

export type NotificationItem = {
    id: string;
    title: string;
    message: string;
    category: 'education' | 'social';
    is_read: boolean;
    created_at: string;
};

// 🔥 Приймаємо нові пропси
export default function NotificationSidebar({ 
    isOpen,
    onClose, 
    unreadEdu, 
    unreadSoc 
}: { 
    isOpen: boolean,
    onClose: () => void, 
    unreadEdu?: boolean, 
    unreadSoc?: boolean 
}) {
    const [activeTab, setActiveTab] = useState<'education' | 'social'>('education');
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const sortedNotifications = useMemo(() => {
        return [...notifications].sort((a, b) => {
            if (a.is_read !== b.is_read) return a.is_read ? 1 : -1; 
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }, [notifications]);

    const fetchNotifications = async (pageNum: number, category: string) => {
        if (loading) return;
        setLoading(true);

        try {
            const res = await apiRequest(`/notifications/?category=${category}&page=${pageNum}`);
            if (res?.ok) {
                const data = await res.json();
                
                if (pageNum === 1) {
                    setNotifications(data.results);
                } else {
                    setNotifications(prev => [...prev, ...data.results]);
                }
                setHasMore(data.next !== null);

                // 🔥 Оновлюємо глобальний статус, якщо підвантажили сторінку з непрочитаними
                if (data.results.some((n: any) => !n.is_read)) {
                    window.dispatchEvent(new CustomEvent('update_unread_status', {
                        detail: { category, hasUnread: true }
                    }));
                }
            }
        } catch (e) {
            console.error("Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setNotifications([]);
        setPage(1);
        setHasMore(true);
        setExpandedId(null);
        fetchNotifications(1, activeTab);
    }, [activeTab]);

    // 🔥 ДОДАЄМО В РЕАЛЬНОМУ ЧАСІ З СОКЕТА
    useEffect(() => {
        const handleNewSocketNotification = (e: Event) => {
            const customEvent = e as CustomEvent;
            const newNotif = customEvent.detail;

            if (newNotif.category === activeTab || !newNotif.category) {
                const notificationObj: NotificationItem = {
                    id: newNotif.id || newNotif.related_id || Date.now().toString(),
                    title: newNotif.title || "Нове сповіщення",
                    message: newNotif.message || "",
                    category: newNotif.category || activeTab,
                    is_read: false, 
                    created_at: newNotif.created_at || new Date().toISOString(),
                };

                setNotifications(prev => {
                    if (prev.find(n => n.id === notificationObj.id)) return prev;
                    return [notificationObj, ...prev];
                });
            }
        };

        window.addEventListener('new_notification', handleNewSocketNotification);
        return () => window.removeEventListener('new_notification', handleNewSocketNotification);
    }, [activeTab]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
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
            // Оновлюємо локально
            const updatedNotifs = notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
            setNotifications(updatedNotifs);
            
            // 🔥 Перевіряємо, чи залишились ще непрочитані
            const stillHasUnread = updatedNotifs.some(n => !n.is_read);
            
            // Повідомляємо ButtonsMenu
            window.dispatchEvent(new CustomEvent('update_unread_status', {
                detail: { category: activeTab, hasUnread: stillHasUnread }
            }));

            // Відправляємо на бекенд
            await apiRequest(`/notifications/${id}/read/`, { method: 'POST' });
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
    };

    // Компонент маленького червоного індикатора для вкладок
    const TabDot = () => (
        <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-main, #d42b2b)', borderRadius: '50%', marginLeft: '6px', display: 'inline-block' }}></div>
    );

    return (
        <>
        {/* Затемнення фону */}
            <div 
                className={`${styles.overlay} ${isOpen ? styles.active : ''}`} 
                onClick={onClose} 
            />
            <div className={styles.overlay} onClick={onClose}></div>
            <div className={styles.Sidebar}>
               <div className={styles.header}>
                    <h2>Сповіщення</h2>
                    <div className={styles.closeBtn} onClick={onClose}>
                        <div style={{ transform: 'rotate(45deg)' }}>{SVG_PLUS}</div>
                    </div>
                </div>

                <div className={styles.tabs}>
                    <div 
                        className={`${styles.tab} ${activeTab === 'education' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('education')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        Навчання
                        {/* 🔥 Показуємо крапочку, якщо є непрочитані */}
                        {unreadEdu && <TabDot />} 
                    </div>
                    <div 
                        className={`${styles.tab} ${activeTab === 'social' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('social')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        Соціальне
                        {/* 🔥 Показуємо крапочку, якщо є непрочитані */}
                        {unreadSoc && <TabDot />}
                    </div>
                </div>

                <div className={styles.notificationList} onScroll={handleScroll}>
                    {sortedNotifications.length === 0 && !loading ? (
                        <div className={styles.emptyMsg}>Немає сповіщень у цій категорії</div>
                    ) : (
                        sortedNotifications.map(n => { 
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