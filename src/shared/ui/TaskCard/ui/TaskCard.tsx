import type { Task } from "../../../../entities/task/model/types"
import { formatDate, getDaysRemaining } from "../../../lib/formatDate"
import { SVG_A } from "../../icons/icons"
import styles from "./TaskCard.module.css"

export default function TaskCard({ onClick, task, mark }: { onClick: () => void, task: Task, mark?: number }) {

    const getMarkClass = () => {
        if (mark && mark > 0) {
            if (mark >= 9 && mark <= 12) return styles.high
            if (mark >= 6 && mark <= 8) return styles.medium
            if (mark >= 1 && mark <= 5) return styles.low
        }
        return ""
    }

    const deadlineStatus = getDaysRemaining(task.end);
    const isOverdue = deadlineStatus === "Прострочено";

    return <div className={styles.taskCard}>
        {(mark || (mark ?? 0) > 0) && <div className={`${styles.mark} ${getMarkClass()}`}>
            {mark}
        </div>}
        <div className={styles.taskImg}></div>
        <div className={styles.taskInfo}>
            <div className={styles.top}>
                <div className={styles.title}>{task.subject_name}</div>
                <div className={styles.icon} onClick={onClick}>{SVG_A}</div>
            </div>
            <div className={styles.botton}>
                <div className={styles.topic}>Тема: {task.theme}</div>
                {(!mark && mark !== 0) && <div className={styles.date}>
                    <div className={styles.period}>{`${formatDate(task.start)}-${formatDate(task.end)}`}</div>
                    <div className={styles.deadlineInfo}>
                        {isOverdue ? <div className={styles.overdue}>{deadlineStatus}</div>
                            : <>
                                <div>Залишилось: </div>
                                <div className={styles.deadline}>{deadlineStatus}</div>
                            </>}
                    </div>
                </div>}

            </div>
        </div>
    </div>
}