import { Link } from "react-router-dom"
import styles from "./TaskPage.module.css"

export default function TasksExaminationPage() {
    return <>
    <title>Quack | Завдання</title>
    
        <div className={styles.menu}>
            <Link to="/tasks">До виконання</Link>
            <div className={styles.line}></div>
            <div className={styles.current}><Link to="/tasks/examination">На перевірці</Link></div>
            <div className={styles.line}></div>
            <Link to="/tasks/done">Перевірені</Link>
        </div>
    </>
}