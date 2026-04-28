import { useState, useEffect, useMemo } from "react";
import styles from "./MobileNotification.module.css";
import { apiRequest } from "../../../api/api";
import { SVG_PLUS } from "../../icons/icons";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export type NotificationItem = {
    id: string; title: string; message: string; category: 'education' | 'social';
    is_read: boolean; created_at: string; related_object_id?: string | null;
};

export default function MobileNotification({ isOpen, onClose, unreadEdu, unreadSoc }: {
    isOpen: boolean, onClose: () => void, unreadEdu?: boolean, unreadSoc?: boolean
}) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'education' | 'social'>('education');
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isMarkingAll, setIsMarkingAll] = useState(false);

    const sortedNotifications = useMemo(() => {
        return [...notifications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [notifications]);

    const fetchNotifications = async (pageNum: number, category: string) => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await apiRequest(`/notifications/?category=${category}&page=${pageNum}`);
            if (res?.ok) {
                const data = await res.json();
                if (pageNum === 1) setNotifications(data.results);
                else setNotifications(prev => [...prev, ...data.results]);
                setHasMore(data.next !== null);
                if (data.results.some((n: any) => !n.is_read)) {
                    window.dispatchEvent(new CustomEvent('update_unread_status', { detail: { category, hasUnread: true } }));
                }
            }
        } catch (e) {
            console.error("Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setNotifications([]); setPage(1); setHasMore(true); setExpandedId(null);
        if (isOpen) fetchNotifications(1, activeTab);
    }, [activeTab, isOpen]);

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
            const updatedNotifs = notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
            setNotifications(updatedNotifs);

            const stillHasUnread = updatedNotifs.some(n => !n.is_read);

            window.dispatchEvent(new CustomEvent('update_unread_status', {
                detail: { category: activeTab, hasUnread: stillHasUnread }
            }));

            await apiRequest(`/notifications/${id}/read/`, { method: 'POST' });
        }
    };

    // 🔥 НОВА ФУНКЦІЯ "ПРОЧИТАТИ ВСЕ" 🔥
    const handleReadAll = async () => {
        if (isMarkingAll) return;
        setIsMarkingAll(true);

        try {
            const res = await apiRequest('/notifications/read-all/', { method: 'POST' });

            if (res?.ok) {
                // 1. Відмічаємо всі локальні сповіщення як прочитані
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

                // 2. Гасимо червоні крапочки глобально для обох категорій
                window.dispatchEvent(new CustomEvent('update_unread_status', {
                    detail: { category: 'education', hasUnread: false }
                }));
                window.dispatchEvent(new CustomEvent('update_unread_status', {
                    detail: { category: 'social', hasUnread: false }
                }));

                toast.success("Всі сповіщення прочитані!");
            }
        } catch (e) {
            toast.error("Помилка на сервері");
        } finally {
            setIsMarkingAll(false);
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
    };

    const getNotificationLink = (n: NotificationItem): string | null => {
        if (!n.related_object_id) return null;

        const t = n.title.toLowerCase();

        // ==========================================
        // 1. АПКА PROFILES (Соціальні сповіщення)
        // ==========================================

        // Чат: "Нове повідомлення" -> відкриваємо сторінку чату
        if (t.includes("повідомлення")) {
            return `/chats/${n.related_object_id}`;
        }

        if (t.includes("відповідь")) {
            const parts = n.related_object_id.split(':');

            // Якщо прийшло два ID (новий формат)
            if (parts.length === 2) {
                const postId = parts[0];
                const userId = parts[1];
                return `/profile/${userId}?post=${postId}`;
            }
        }
        // Пости: "Нова реакція!", "Новий коментар", "Відповідь на коментар"
        // Ведемо на свій профіль (/profile) і передаємо ?post=id, щоб спрацював плавний скрол
        if (t.includes("реакція") || t.includes("коментар")) {
            return `/profile?post=${n.related_object_id}`;
        }

        // ==========================================
        // 2. АПКА EDUCATION (Навчальні сповіщення)
        // ==========================================

        // Новини: "Нова новина!" -> сторінка всіх новин
        if (t.includes("новина")) {
            return `/news`;
        }

        if (t.includes("оцінено")) {
            return `/archive`;
        }

        // Завдання (Студенту): "Нове завдання: ..."
        if (t.includes("завдання")) {
            return `/tasks`;
        }

        // Завдання (Вчителю): "Нова робота на перевірку!"
        if (t.includes("перевірку")) {
            return `/managechecktasks`;
        }

        // Розклад: "Оновлення розкладу" (Вчителю), "Зміни в розкладі!" (Студенту)
        if (t.includes("розклад")) {
            return `/calendar`;
        }

        // Дії на парі: "Відвідуваність", "Нова оцінка!", "Качка за активність!"
        if (t.includes("відвідуваність") || t.includes("оцінка") || t.includes("качка")) {
            return `/`;
        }

        return null;
    };

    const TabDot = () => <div className={styles.tabDot}></div>;

    return (
        <>
            <div className={`${styles.overlay} ${isOpen ? styles.active : ''}`} onClick={onClose} />
            <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
                <div className={styles.dragHandle}></div>

                <div className={styles.header}>
                    <h2>Сповіщення</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
                        <button
                            className={styles.readAllBtn}
                            onClick={handleReadAll}
                            disabled={isMarkingAll || notifications.length === 0}
                        >
                            {isMarkingAll ? 'Зачекайте...' : 'Прочитати все'}
                        </button>
                        <div className={styles.closeBtn} onClick={onClose}>
                            <div style={{ transform: 'rotate(45deg)' }}>{SVG_PLUS}</div>
                        </div>
                    </div>
                </div>

                <div className={styles.tabs}>
                    <div className={`${styles.tab} ${activeTab === 'education' ? styles.tabActive : ''}`} onClick={() => setActiveTab('education')}>
                        Навчання {unreadEdu && <TabDot />}
                    </div>
                    <div className={`${styles.tab} ${activeTab === 'social' ? styles.tabActive : ''}`} onClick={() => setActiveTab('social')}>
                        Соціальне {unreadSoc && <TabDot />}
                    </div>
                </div>

                <div className={styles.notificationList} onScroll={handleScroll}>
                    {sortedNotifications.length === 0 && !loading ? (
                        <div className={styles.emptyMsg}>Немає сповіщень у цій категорії</div>
                    ) : (
                        sortedNotifications.map(n => {
                            const isExpanded = expandedId === n.id;
                            const actionLink = getNotificationLink(n);
                            return (
                                <div key={n.id} className={`${styles.card} ${!n.is_read ? styles.unread : ''} ${isExpanded ? styles.expanded : ''}`} onClick={() => handleNotificationClick(n.id)}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardTitle}>{n.title}</div>
                                        <div className={styles.cardTime}>{formatTime(n.created_at)}</div>
                                    </div>
                                    <div className={styles.cardMessage}>
                                        {n.message}
                                        {isExpanded && actionLink && (
                                            <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); onClose(); navigate(actionLink); }}>
                                                Перейти →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    {loading && <div className={styles.loading}><img src="/gifs/loading.svg" alt="loading" /></div>}
                </div>
            </div>
        </>
    );
}