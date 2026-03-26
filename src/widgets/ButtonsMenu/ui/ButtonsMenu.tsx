import { useState } from 'react';
import { SVG_NOTIFICATION, SVG_CALENDAR } from '../../../shared/ui/icons/icons'
import RoundButton from '../../../shared/ui/RoundButton/RoundButton'
import RoleSwitch from '../../RoleSwitch/ui/RoleSwitch'
import styles from './ButtonsMenu.module.css'
import NotificationSidebar from '../../../shared/ui/NotificationSidebar/ui/NotificationSidebar';

export default function ButtonsMenu({ direction = "vertical" }) {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    return <>
        <div className={`${styles.menu} ${styles[direction]}`}>
            <RoleSwitch />
            <div onClick={() => setIsNotificationsOpen(true)}>
                <RoundButton button={{ icon: SVG_NOTIFICATION, text: "Сповіщення" }} />
            </div>
            <RoundButton button={{ icon: SVG_CALENDAR, text: "Розклад" }} />
        </div>
        {isNotificationsOpen && (
            <NotificationSidebar onClose={() => setIsNotificationsOpen(false)} />
        )}
    </>
}