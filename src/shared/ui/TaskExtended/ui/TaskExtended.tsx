import ActionButton from "../../ActionButton/ui/ActionButton"
import { SVG_PLUS } from "../../icons/icons"
import styles from "./TaskExtended.module.css"

export default function TaskExtended({onClick}: {onClick: () => void}) {
    return <div className={styles.TaskExtended}>
        <div className={styles.icon} onClick={onClick}>{SVG_PLUS}</div>
        <div className={styles.top}>
            <div className={styles.subject}>Фізика</div>
            <div className={styles.date}>01.02-01.04</div>
        </div>
        <div className={styles.topic}>
            <div className={styles.topicTitle}>Тема:</div>
            <div className={styles.info}>Тема самого крутого задания</div>
        </div>
        <div className={styles.description}>
            <div className={styles.descriptionTitle}>Опис:</div>
            <div className={styles.info}>Опис самого крутого задания</div>
        </div>
        <ActionButton actionButton={{text: "Відкрити завдання", enabled: false}}/>
    </div>
}