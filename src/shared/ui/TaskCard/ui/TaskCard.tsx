import { SVG_A } from "../../icons/icons"
import styles from "./TaskCard.module.css"

export default function TaskCard() {
    return <div className={styles.taskCard}>
        <div className={styles.taskImg}></div>
        <div className={styles.taskInfo}>
            <div className={styles.top}>
                <div className={styles.title}>Основи ведення командного...</div>
                <div className={styles.icon}>{SVG_A}</div>
            </div>
            <div className={styles.botton}>
                <div>Тема: Оптика і бла бла бла бла бла бла </div>
                <div className={styles.date}>
                    <div>01.01-08.01</div>
                    <div className={styles.deadlineInfo}>
                        <div className={styles.deadline}>Залишилось: </div>
                        <div>1дн.</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}