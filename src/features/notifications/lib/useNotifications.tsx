import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// 🔥 ФУНКЦІЯ МАРШРУТИЗАЦІЇ (Копія з NotificationSidebar) 🔥
const getNotificationLink = (n: any): string | null => {
    if (!n.related_object_id) return null;
    
    const t = (n.title || "").toLowerCase();

    // 1. АПКА PROFILES (Соціальні сповіщення)
    if (t.includes("повідомлення")) return `/chats/${n.related_object_id}`;
    
    if(t.includes("відповідь")) {
        const parts = String(n.related_object_id).split(':');
        if (parts.length === 2) {
            return `/profile/${parts[1]}?post=${parts[0]}`;
        }
    }
    
    if (t.includes("реакція") || t.includes("коментар")) return `/profile?post=${n.related_object_id}`;

    // 2. АПКА EDUCATION (Навчальні сповіщення)
    if (t.includes("новина")) return `/news`;
    if (t.includes("оцінено")) return `/archive`; 
    if (t.includes("завдання")) return `/tasks`; 
    if (t.includes("перевірку")) return `/managechecktasks`; 
    if (t.includes("розклад")) return `/calendar`;
    if (t.includes("відвідуваність") || t.includes("оцінка") || t.includes("качка")) return `/`; 

    return null;
};

export const useNotifications = () => {
    const navigate = useNavigate(); // 🔥 Додано хук навігації

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        let wsBaseUrl = '';
        if (import.meta.env.VITE_API_URL) {
            wsBaseUrl = import.meta.env.VITE_API_URL.replace(/^http/, 'ws');
        } else {
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            if (import.meta.env.DEV) {
                wsBaseUrl = 'ws://127.0.0.1:8000';
            } else {
                wsBaseUrl = `${wsProtocol}//quackdemo.duckdns.org`;
            }
        }

        const wsUrl = `${wsBaseUrl}/ws/notifications/?token=${token}`;
        const socket = new WebSocket(wsUrl);

        socket.onclose = (event) => console.log("❌ Сокет закрито! Код:", event.code);
        socket.onopen = () => console.log("✅ Сокет підключено!");

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Отримано по сокету:", data);

            const activeChatId = (window as any).activeChatId || localStorage.getItem('activeChatId');
            const isCurrentChatEvent = data.category === 'social' && String(data.related_object_id) === String(activeChatId);

            if (!isCurrentChatEvent && data.message) {
                // 🔥 Дістаємо лінк для сповіщення 🔥
                const actionLink = getNotificationLink(data);

                if (actionLink) {
                    // Якщо лінк знайдено, робимо тост клікабельним
                    toast.success(
                        (t) => (
                            <div 
                                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }} 
                                onClick={() => {
                                    toast.dismiss(t.id); // Закриваємо тост по кліку
                                    navigate(actionLink); // Переходимо на сторінку
                                }}
                            >
                                <span>{data.message}</span>
                                <span style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px', fontWeight: 600 }}>
                                    Натисніть, щоб перейти ↗
                                </span>
                            </div>
                        ), 
                        { duration: 6000 }
                    );
                } else {
                    // Звичайний тост, якщо лінку немає
                    toast.success(data.message, { duration: 6000 });
                }
            }

            window.dispatchEvent(new CustomEvent('new_notification', { detail: data }));
        };

        socket.onerror = (error) => console.error("Помилка WebSocket:", error);

        return () => {
            if (socket.readyState === 1) socket.close();
        };
    }, [navigate]); // 🔥 Додали navigate в залежності useEffect
};