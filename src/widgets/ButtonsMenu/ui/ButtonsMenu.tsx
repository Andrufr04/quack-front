import { SVG_NOTIFICATION, SVG_CALENDAR } from '../../../shared/ui/icons/icons'
import RoundButton from '../../../shared/ui/RoundButton/RoundButton'
import RoleSwitch from '../../RoleSwitch/ui/RoleSwitch'
import styles from './ButtonsMenu.module.css'

export default function ButtonsMenu({ direction = "vertical" }) {
    return <div className={`${styles.menu} ${styles[direction]}`}>
        <RoleSwitch />
        <RoundButton button={{ icon: SVG_NOTIFICATION, text: "Сповіщення" }} />
        <RoundButton button={{ icon: SVG_CALENDAR, text: "Розклад" }} />
    </div>
}