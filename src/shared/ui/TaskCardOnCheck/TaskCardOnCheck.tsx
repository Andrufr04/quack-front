import type { TeacherTaskToCheck } from "../../../entities/task/model/types"
import { SVG_A } from "../icons/icons"
import styles from "./TaskCardOnCheck.module.css"

export default function TaskCardOnCheck({ onClick, task, selected }: { onClick: () => void, task: TeacherTaskToCheck, selected: boolean }) {

    return <div className={`${styles.taskCard} ${selected ? styles.cardSelected : ""}`}>
        <div className={styles.taskImg} style={task.task.subject_image ? { backgroundImage: `url(${task.task.subject_image})` } : {}}></div>
        <div className={styles.taskInfo}>
            <div className={styles.top}>
                <div className={styles.title}>{task.task.subject_name}</div>
                <div className={styles.icon} onClick={onClick}>{SVG_A}</div>
            </div>
            <div className={styles.botton}>
                <div className={styles.topic}>Студент: {task.student_name}</div>
                <div className={styles.date}>
                    <div className={styles.period}>{`${task.group_name}`}</div>
                </div>
            </div>
        </div>
    </div>
}