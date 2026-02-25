import type { ActionButtonProps } from '../model/actionButtonType'
import styles from './ActionButton.module.css'

export default function ActionButton({actionButton}: {actionButton: ActionButtonProps}) {

    const onClick = () => {
        if (actionButton.enabled) {
            actionButton.onClick()
        }
    }

    return <div className={styles.button} onClick={onClick}>
        <div className={styles.text + " bold"}>{actionButton.text}</div>
    </div>
}