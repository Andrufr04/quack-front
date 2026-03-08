import { Link } from "react-router-dom"
import styles from "./TaskPage.module.css"
import TaskCard from "../../../shared/ui/TaskCard/ui/TaskCard"
import { useEffect, useState } from "react"
import TaskExtended from "../../../shared/ui/TaskExtended/ui/TaskExtended"
import { apiRequest } from "../../../shared/api/api"

export interface Task {
    id: string
    subject_name: string
    task_type_name: string
    theme: string
    description: string
    start: string
    end: string
}

export default function TasksPage() {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])

    function selectTask(task: Task) {
        if (selectedTask == task) {
            setSelectedTask(null)
            return
        }
        setSelectedTask(task)
    }

    useEffect(() => {
        const loadTasks = async () => {
            const token = localStorage.getItem('access_token')

            try {
                const response = await apiRequest('/api/education/my/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                })
                if (!response) return
                if (!response.ok) {
                    console.log(`Помилка сервера: ${response.status}`)
                    return
                }

                const data = await response.json()
                setTasks(data)
            } catch (err) {
                console.log(err)
            }
        };

        loadTasks();
    }, []);

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
            {tasks.map(t => <TaskCard key={t.id} task={t} onClick={() => selectTask(t)} mark={7}/>)}
        </div>

        {selectedTask && <TaskExtended onCloseClick={() => setSelectedTask(null)} task = {selectedTask} />}
    </>
}