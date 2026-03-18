import { Link } from "react-router-dom"
import styles from "./TaskPage.module.css"
import { useState, useEffect } from "react"
import { isStudent } from "../../../entities/session/lib/jwt"
import { taskApi } from "../../../entities/task/api/taskApi"
import type { TaskStatus } from "../../../entities/task/model/types"
import TaskCard from "../../../shared/ui/TaskCard/ui/TaskCard"
import TaskExtendedChecked from "../../../shared/ui/TaskExtendedChecked/ui/TaskExtendedChecked"
import Page403 from "../../Page403/ui/Page403"

export default function TasksDonePage() {
    if (!isStudent()) return <Page403/>
    const [selectedTask, setSelectedTask] = useState<TaskStatus | null>(null)
    const [tasks, setTasks] = useState<TaskStatus[]>([])

    function selectTask(statusObj: TaskStatus) {
        if (selectedTask?.id === statusObj.id) {
            setSelectedTask(null);
            return;
        }
        setSelectedTask(statusObj);
    }

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await taskApi.getStudentTasks(2);

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
    }, []);

    return <>
        <title>Quack | Завдання</title>

        <div className={styles.menu}>
            <Link to="/tasks">До виконання</Link>
            <div className={styles.line}></div>
            <Link to="/tasks/examination">На перевірці</Link>
            <div className={styles.line}></div>
            <div className={styles.current}><Link to="/tasks/done">Перевірені</Link></div>
        </div>

        <div className={styles.container}>
            {tasks.map(t => <TaskCard key={t.id} task={t.task} onClick={() => selectTask(t)} mark={(t.mark ?? 0)}/>)}
        </div>

        {selectedTask && <TaskExtendedChecked onCloseClick={() => setSelectedTask(null)} task={selectedTask} />}
    </>
}