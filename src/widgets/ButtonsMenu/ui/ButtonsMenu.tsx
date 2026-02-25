import { SVG_NOTIFICATION, SVG_CALENDAR } from '../../../shared/ui/icons/icons'
import RoundButton from '../../../shared/ui/RoundButton/RoundButton'
import styles from './ButtonsMenu.module.css'

export default function ButtonsMenu() {
    return <div className={styles.menu}>
        <RoundButton button={{ icon: SVG_NOTIFICATION, text: "Сповіщення" }} />
        <RoundButton button={{ icon: SVG_CALENDAR, text: "Розклад" }} />
    </div>
}