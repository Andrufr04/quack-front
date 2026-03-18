import type { TaskStatus } from "../../../../entities/task/model/types"
import { SVG_PLUS } from "../../icons/icons"
import styles from "./TaskExtendedChecked.module.css"

export default function TaskExtendedChecked({ onCloseClick, task }: { onCloseClick: () => void, task: TaskStatus }) {

    return (
        <div className={styles.TaskExtended}>
            <div className={styles.icon} onClick={onCloseClick}>{SVG_PLUS}</div>

            <div className={styles.topic}>
                <div className={styles.topicTitle}>Тема:</div>
                <div className={styles.info}>{task.task.theme}</div>
            </div>

            <div className={styles.description}>
                <div className={styles.descriptionTitle}>Опис:</div>
                <pre className={styles.descriptionInfo}>{task.task.description}</pre>
            </div>
            <br/>
            <div className={styles.topic}>
                <div className={styles.topicTitle}>Коментар від викладача:</div>
                <div className={styles.info}>{task.comment}</div>
            </div>

            <div className={styles.description}>
                <div className={styles.descriptionTitle}>Оцінка:</div>
                <pre className={styles.info}>{task.mark}</pre>
            </div>
        </div>
    )
}

