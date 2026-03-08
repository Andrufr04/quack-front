import type { Task } from "../../../../pages/TasksPage/ui/TaskPage"
import { formatDate } from "../../../lib/formatDate"
import ActionButton from "../../ActionButton/ui/ActionButton"
import { SVG_PLUS } from "../../icons/icons"
import styles from "./TaskExtended.module.css"

export default function TaskExtended({onCloseClick, task}: {onCloseClick: () => void, task: Task}) {
    return <div className={styles.TaskExtended}>
        <div className={styles.icon} onClick={onCloseClick}>{SVG_PLUS}</div>
        <div className={styles.top}>
            <div className={styles.subject}>{task.subject_name}</div>
            <div className={styles.date}>{`${formatDate(task.start)}-${formatDate(task.end)}`}</div>
        </div>
        <div className={styles.topic}>
            <div className={styles.topicTitle}>Тема:</div>
            <div className={styles.info}>{task.theme}</div>
        </div>
        <div className={styles.description}>
            <div className={styles.descriptionTitle}>Опис:</div>
            <div className={styles.info}>{task.description}</div>
        </div>
        <ActionButton actionButton={{text: "Відкрити завдання", enabled: false}}/>
    </div>
}