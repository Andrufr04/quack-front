import { useState, useEffect } from 'react';
import { SVG_NOTIFICATION, SVG_CALENDAR } from '../../../shared/ui/icons/icons'
import RoundButton from '../../../shared/ui/RoundButton/RoundButton'
import RoleSwitch from '../../RoleSwitch/ui/RoleSwitch'
import styles from './ButtonsMenu.module.css'
import NotificationSidebar from '../../../shared/ui/NotificationSidebar/ui/NotificationSidebar';
import { apiRequest } from '../../../shared/api/api';

export default function ButtonsMenu({ direction = "vertical" }) {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    
    // 🔥 Окремі стейти для категорій
    const [unreadEdu, setUnreadEdu] = useState(false);
    const [unreadSoc, setUnreadSoc] = useState(false);

    useEffect(() => {
        const checkUnread = async () => {
            try {
                const resEdu = await apiRequest('/notifications/?category=education&page=1');
                if (resEdu?.ok) {
                    const data = await resEdu.json();
                    setUnreadEdu(data.results?.some((n: any) => !n.is_read));
                }
                
                const resSoc = await apiRequest('/notifications/?category=social&page=1');
                if (resSoc?.ok) {
                    const data = await resSoc.json();
                    setUnreadSoc(data.results?.some((n: any) => !n.is_read));
                }
            } catch (e) {
                console.error(e);
            }
        }
        checkUnread();

        // Слухаємо нові сповіщення з сокета
        const handleNew = (e: Event) => {
            const customEvent = e as CustomEvent;
            const cat = customEvent.detail?.category;
            if (cat === 'education') setUnreadEdu(true);
            if (cat === 'social') setUnreadSoc(true);
        };

        // 🔥 Слухаємо, коли юзер прочитав сповіщення всередині сайдбара
        const handleUpdate = (e: Event) => {
            const customEvent = e as CustomEvent;
            const { category, hasUnread } = customEvent.detail;
            if (category === 'education') setUnreadEdu(hasUnread);
            if (category === 'social') setUnreadSoc(hasUnread);
        };

        window.addEventListener('new_notification', handleNew);
        window.addEventListener('update_unread_status', handleUpdate);

        return () => {
            window.removeEventListener('new_notification', handleNew);
            window.removeEventListener('update_unread_status', handleUpdate);
        };
    }, []);

    // Головний кружечок горить, якщо хоча б десь є непрочитані
    const hasAnyUnread = unreadEdu || unreadSoc;

    return <>
        <div className={`${styles.menu} ${styles[direction]}`}>
            <RoleSwitch />
            <div 
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => setIsNotificationsOpen(true)} // Кружечок більше не зникає просто так!
            >
                {hasAnyUnread && (
                    <div className={styles.notification}></div>
                )}
                <RoundButton button={{ icon: SVG_NOTIFICATION, text: "Сповіщення" }} />
            </div>
            <RoundButton button={{ icon: SVG_CALENDAR, text: "Розклад" }} />
        </div>
        
        {isNotificationsOpen && (
            <NotificationSidebar 
                onClose={() => setIsNotificationsOpen(false)} 
                // 🔥 Передаємо стейти всередину сайдбара
                unreadEdu={unreadEdu} 
                unreadSoc={unreadSoc} 
            />
        )}
    </>
}