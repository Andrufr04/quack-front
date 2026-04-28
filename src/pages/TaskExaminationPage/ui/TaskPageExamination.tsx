import { Link } from "react-router-dom"
import styles from "./TaskPageExamination.module.css"
import { useState, useEffect } from "react"
import { isStudent } from "../../../entities/session/lib/jwt"
import { taskApi } from "../../../entities/task/api/taskApi"
import type { TaskStatus } from "../../../entities/task/model/types"
import TaskCard from "../../../shared/ui/TaskCard/ui/TaskCard"
import TaskExtendedChecked from "../../../shared/ui/TaskExtendedChecked/ui/TaskExtendedChecked"
import Page403 from "../../Page403/ui/Page403"
import TaskExtendedExamination from "../../../shared/ui/TaskExtendedExamination/ui/TaskExtendedExamination"

export default function TasksExaminationPage() {
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
                const data = await taskApi.getStudentTasks(1);

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
            <div className={styles.current}><Link to="/tasks/examination">На перевірці</Link></div>
            <div className={styles.line}></div>
            <Link to="/archive">Архів</Link>
        </div>

        <div className={styles.container}>
            {tasks.map(t => <TaskCard key={t.id} task={t.task} onClick={() => selectTask(t)} mark={0} selected={selectedTask?.id === t.id}/>)}
        </div>

        {selectedTask && <TaskExtendedExamination onCloseClick={() => setSelectedTask(null)} task={selectedTask} />}
    </>
}