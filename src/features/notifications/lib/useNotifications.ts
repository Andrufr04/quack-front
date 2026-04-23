import { useEffect } from 'react';
import toast from 'react-hot-toast';

export const useNotifications = () => {
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
                toast.success(data.message, { duration: 6000 });
            }

            window.dispatchEvent(new CustomEvent('new_notification', { detail: data }));
        };

        socket.onerror = (error) => console.error("Помилка WebSocket:", error);

        return () => {
            if (socket.readyState === 1) socket.close();
        };
    }, []);
};