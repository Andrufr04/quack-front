import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import styles from "./ManageCheckTasks.module.css";
import { taskApi } from "../../../entities/task/api/taskApi";
import type { TeacherTaskToCheck } from "../../../entities/task/model/types";
import TaskCardOnCheck from "../../../shared/ui/TaskCardOnCheck/TaskCardOnCheck";
import TaskExtendedOnCheck from "../../../shared/ui/TaskExtendedOnCheck/ui/TaskExtendedOnCheck";
import Page403 from "../../Page403/ui/Page403";
import { isTeacher } from "../../../entities/session/lib/jwt";

export default function ManageCheckTasks() {
    if (!isTeacher()) return <Page403 />
    const [selectedGroup, setSelectedGroup] = useState("Всі");
    const [groups, setGroups] = useState<{id: string, name: string}[]>([]);
    const [works, setWorks] = useState<TeacherTaskToCheck[]>([]);
    const selectRef = useRef<HTMLSelectElement>(null);

    const [selectedTask, setSelectedTask] = useState<TeacherTaskToCheck | null>(null)

    function selectTask(task: TeacherTaskToCheck) {
        if (selectedTask === task) {
            setSelectedTask(null)
            return
        }
        setSelectedTask(task)
    }

    useEffect(() => {
        taskApi.getTeacherGroups().then(setGroups)
    }, []);

    // 1. Виносимо fetchWorks у useCallback, щоб його можна було викликати звідусіль
    const fetchWorks = useCallback(async () => {
        try {
            const data = await taskApi.getTasksToCheck(selectedGroup === "Всі" ? "" : selectedGroup);
            setWorks(data);
        } catch (err) {
            console.error("Помилка завантаження робіт:", err);
        }
    }, [selectedGroup]);

    // 2. Завантажуємо роботи при зміні групи
    useEffect(() => {
        fetchWorks();
    }, [fetchWorks]);

    // 3. 🔥 МАГІЯ СОКЕТІВ (Слухаємо нові роботи від студентів) 🔥
    useEffect(() => {
        const handleNewSubmission = (e: any) => {
            const notif = e.detail;
            // title="Нова робота на перевірку!" (як ми писали на бекенді)
            if (notif.category === 'education' && notif.title.includes('Нова робота')) {
                fetchWorks();
            }
        };

        window.addEventListener('new_notification', handleNewSubmission);
        return () => window.removeEventListener('new_notification', handleNewSubmission);
    }, [fetchWorks]);

    // 4. Функція, яка спрацює ПІСЛЯ успішної оцінки в модалці
    const handleGradeSuccess = () => {
        setSelectedTask(null); // Закриваємо модалку
        fetchWorks();          // Тихо оновлюємо список робіт
    };

    return (
    <>
    <title>Quack | Перевірити завдання</title>
        <div className={styles.menuPlus}>
            <div className={styles.menu}>
                <Link to="/managetasks">Створити завдання</Link>
                <div className={styles.line}></div>
                <div className={styles.current}><Link to="">Перевірити</Link></div>
            </div>

            <select
                ref={selectRef}
                className={styles.groupSelect}
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
            >
                <option value="Всі">Всі</option>
                {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
        </div>

        <div className={styles.container}>
            {works.map(t => <TaskCardOnCheck key={t.id} task={t} onClick={() => selectTask(t)} selected={selectedTask?.task.id === t.task.id}/>)}
        </div>

        {selectedTask && (
            <TaskExtendedOnCheck 
                onCloseClick={() => setSelectedTask(null)} 
                onSuccess={handleGradeSuccess}
                task={selectedTask} 
            />
        )}
    </>
    );
}