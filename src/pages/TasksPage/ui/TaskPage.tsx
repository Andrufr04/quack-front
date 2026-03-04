import { Link } from "react-router-dom"
import styles from "./TaskPage.module.css"
import TaskCard from "../../../shared/ui/TaskCard/ui/TaskCard"
import { useState } from "react"
import TaskExtended from "../../../shared/ui/TaskExtended/ui/TaskExtended"

export default function TasksPage() {
    const [extended, setExtended] = useState(false)

    return <>
    <title>Quack | Завдання</title>
    
        <div className={styles.menu}>
            <div className={styles.current}><Link to="/tasks">До виконання</Link></div>
            <div className={styles.line}></div>
            <Link to="/tasks/examination">На перевірці</Link>
            <div className={styles.line}></div>
            <Link to="/tasks/done">Перевірені</Link>
        </div>

        <div className={styles.container}>
            <TaskCard onClick={() => setExtended(!extended)}/>
        </div>

        {extended && <TaskExtended onClick={() => setExtended(false)}/>}
    </>
}