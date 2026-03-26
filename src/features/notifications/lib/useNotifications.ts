import { useEffect } from 'react';
import toast from 'react-hot-toast';

export const useNotifications = () => {
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        // 🔥 Бронебійна логіка URL 🔥
        let wsBaseUrl = '';

        if (import.meta.env.VITE_API_URL) {
            wsBaseUrl = import.meta.env.VITE_API_URL.replace(/^http/, 'ws');
        } else {
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            
            if (import.meta.env.DEV) {
                wsBaseUrl = 'ws://127.0.0.1:8000';
            } else {
                const backendHost = 'quackdemo.duckdns.org'; 
                wsBaseUrl = `${wsProtocol}//${backendHost}`;
            }
        }

        const wsUrl = `${wsBaseUrl}/ws/notifications/?token=${token}`;
        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Отримано по сокету:", data);

            toast.success(data.message, {duration: 6000});
            window.dispatchEvent(new CustomEvent('new_notification', { detail: data }));
        };

        socket.onerror = (error) => {
            console.error("Помилка WebSocket:", error);
        };

        return () => {
            if (socket.readyState === 1) { // 1 === OPEN
                socket.close();
            }
        };
    }, []); 
};