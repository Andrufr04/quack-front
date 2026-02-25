import { useNavigate } from 'react-router-dom'
import styles from './RoundButton.module.css'
import type { RoundButtonProps } from './button'

export default function RoundButton({ button }: { button: RoundButtonProps }) {
    const navigate = useNavigate()

    const onClick = () => {
        if (button.slug) {
            navigate(button.slug)
        }
        if (button.onClick) {
            button.onClick()
        }
    }

    return <div className={styles.button} onClick={onClick}>
        <div className={styles.icon}>{button.icon}</div>
    </div>
}