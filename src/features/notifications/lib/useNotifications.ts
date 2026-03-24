import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { isStudent } from '../../../entities/session/lib/jwt'; // Підстав свій шлях

export const useNotifications = (groupId: string | undefined | null) => {
    useEffect(() => {
        // Підключаємо сокет ТІЛЬКИ якщо це студент і ми маємо ID його групи
        if (!isStudent() || !groupId) return;

        const token = localStorage.getItem('access_token');
        if (!token) return;

        // Динамічно визначаємо URL (для локалки і проду)
        // Замінюємо http:// на ws:// (або https:// на wss://)
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
        const wsBaseUrl = apiUrl.replace(/^http/, 'ws'); 
        
        const wsUrl = `${wsBaseUrl}/ws/notifications/${groupId}/?token=${token}`;
        const socket = new WebSocket(wsUrl);

        // Слухаємо повідомлення від Django
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Отримано по сокету:", data);

            // Викликаємо красивий тост
            toast.success(data.message, {duration: 6000})
        };

        socket.onerror = (error) => {
            console.error("Помилка WebSocket:", error);
        };

        // 🔥 НАЙГОЛОВНІШЕ: Cleanup-функція!
        // Закриваємо з'єднання, коли юзер виходить з акаунту або закриває вкладку.
        // Без цього React у режимі розробки створить 2-3 дублікати з'єднань.
        return () => {
            if (socket.readyState === 1) { // 1 === OPEN
                socket.close();
            }
        };
    }, [groupId]); // Хук перезапуститься, якщо зміниться група
};