import type { ActionButtonProps } from '../model/actionButtonType'
import styles from './ActionButton.module.css'

export default function ActionButton({actionButton}: {actionButton: ActionButtonProps}) {

    const onClick = () => {
        if (actionButton.enabled) {
            if (actionButton.onClick) {
                actionButton.onClick()
            }
        }
    }

    return <div style={{
        height: actionButton.height, 
        background: actionButton.enabled ? actionButton.bgcolor : "#ababab", 
        color: actionButton.color,
        cursor: actionButton.enabled ? "pointer" : "not-allowed"}} className={styles.button} onClick={onClick}>
        <div className={styles.text + " bold"}>{actionButton.text}</div>
    </div>
}