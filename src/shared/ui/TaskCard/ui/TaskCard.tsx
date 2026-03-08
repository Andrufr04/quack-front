import type { Task } from "../../../../pages/TasksPage/ui/TaskPage"
import { formatDate } from "../../../lib/formatDate"
import { SVG_A } from "../../icons/icons"
import styles from "./TaskCard.module.css"

export default function TaskCard({ onClick, task, mark }: { onClick: () => void, task: Task, mark?: number }) {

    const getMarkClass = () => {
        if (mark) {
            if (mark >= 9 && mark <= 12) return styles.high
            if (mark >= 6 && mark <= 8) return styles.medium
            if (mark >= 1 && mark <= 5) return styles.low
        }
        return ""
    }

    return <div className={styles.taskCard}>
        <div className={`${styles.mark} ${getMarkClass()}`}>
            {mark}
        </div>
        <div className={styles.taskImg}></div>
        <div className={styles.taskInfo}>
            <div className={styles.top}>
                <div className={styles.title}>{task.subject_name}</div>
                <div className={styles.icon} onClick={onClick}>{SVG_A}</div>
            </div>
            <div className={styles.botton}>
                <div className={styles.topic}>Тема: {task.theme}</div>
                <div className={styles.date}>
                    {/* <div className={styles.period}>01.03-05.03</div> */}
                    <div className={styles.period}>{`${formatDate(task.start)}-${formatDate(task.end)}`}</div>
                    <div className={styles.deadlineInfo}>
                        <div className={styles.deadline}>Залишилось: </div>
                        <div>1д</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}