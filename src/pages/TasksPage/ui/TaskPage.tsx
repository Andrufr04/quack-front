import { Link } from "react-router-dom"
import styles from "./TaskPage.module.css"
import TaskCard from "../../../shared/ui/TaskCard/ui/TaskCard"
import { useEffect, useState } from "react"
import TaskExtended from "../../../shared/ui/TaskExtended/ui/TaskExtended"
import { taskApi } from "../../../entities/task/api/taskApi"
import type { Task, TaskStatus } from "../../../entities/task/model/types"
import { isStudent } from "../../../entities/session/lib/jwt"
import Page403 from "../../Page403/ui/Page403"

export default function TasksPage() {
    if (!isStudent()) return <Page403/>
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [tasks, setTasks] = useState<TaskStatus[]>([])

    function selectTask(task: Task) {
        if (selectedTask == task) {
            setSelectedTask(null)
            return
        }
        setSelectedTask(task)
    }

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await taskApi.getStudentTasks(0);

                if (Array.isArray(data)) {
                    setTasks(data);
                } else {
                    setTasks([]);
                    console.error("Отримано невірний формат даних:", data);
                }

            } catch (err) {
                setTasks([]);
                console.error("Не вдалося завантажити завдання:", err);
            }
        };

        fetchTasks();
    }, [selectedTask]);

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
            {tasks.map(t => <TaskCard key={t.id} task={t.task} onClick={() => selectTask(t.task)} />)}
        </div>

        {selectedTask && <TaskExtended onCloseClick={() => setSelectedTask(null)} task={selectedTask} />}
    </>
}