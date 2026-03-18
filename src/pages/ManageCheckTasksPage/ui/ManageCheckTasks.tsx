import { useEffect, useRef, useState } from "react";
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
        if (selectedTask == task) {
            setSelectedTask(null)
            return
        }
        setSelectedTask(task)
    }

    useEffect(() => {
        taskApi.getTeacherGroups().then(setGroups)
    }, []);

    // 2. Завантажуємо роботи при зміні групи
    useEffect(() => {
        const fetchWorks = async () => {
            try {
                // Передаємо selectedGroup на бекенд
                const data = await taskApi.getTasksToCheck(selectedGroup === "Всі" ? "" : selectedGroup);
                setWorks(data);
            } catch (err) {
                console.error("Помилка завантаження робіт:", err);
            }
        };
        fetchWorks();
    }, [selectedGroup]);

    useEffect(() => {
        if (selectRef.current) {
            const tempSpan = document.createElement("span");
            tempSpan.style.visibility = "hidden";
            tempSpan.style.position = "absolute";
            tempSpan.style.font = window.getComputedStyle(selectRef.current).font;
            tempSpan.textContent = selectedGroup;
            document.body.appendChild(tempSpan);

            const arrowWidth = 25;
            selectRef.current.style.width = tempSpan.offsetWidth + arrowWidth + "px";

            document.body.removeChild(tempSpan);
        }
    }, [selectedGroup]);

    return (<>
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
                <option>Всі</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
        </div>

        <div className={styles.container}>
            {works.map(t => <TaskCardOnCheck key={t.id} task={t} onClick={() => selectTask(t)} />)}
        </div>

        {selectedTask && <TaskExtendedOnCheck onCloseClick={() => setSelectedTask(null)} task={selectedTask} />}
    </>
    );
}