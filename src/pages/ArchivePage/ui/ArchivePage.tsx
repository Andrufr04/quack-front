import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./ArchivePage.module.css";
import taskStyles from "../../TasksPage/ui/TaskPage.module.css"; // Імпортуємо стилі для карток завдань
import { isStudent } from "../../../entities/session/lib/jwt";
import { taskApi } from "../../../entities/task/api/taskApi";
import type { TaskStatus } from "../../../entities/task/model/types";
import TaskCard from "../../../shared/ui/TaskCard/ui/TaskCard";
import TaskExtendedChecked from "../../../shared/ui/TaskExtendedChecked/ui/TaskExtendedChecked";
import Page403 from "../../Page403/ui/Page403";
import { SVG_ARROW_DOWN } from "../../../shared/ui/icons/icons";

export default function ArchivePage() {
    if (!isStudent()) return <Page403 />;

    const [tasks, setTasks] = useState<TaskStatus[]>([]);
    const [selectedTask, setSelectedTask] = useState<TaskStatus | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

    const fetchTasks = async () => {
        try {
            const data = await taskApi.getStudentTasks(2); // 2 = перевірені
            if (Array.isArray(data)) {
                setTasks(data);
            } else {
                setTasks([]);
            }
        } catch (err) {
            setTasks([]);
            console.error("Не вдалося завантажити архів:", err);
        }
    };

    useEffect(() => {
        fetchTasks();

        const handleNewNotification = (e: any) => {
            const notif = e.detail;
            if (notif.category === 'education' && notif.title.toLowerCase().includes('оцінено')) {
                fetchTasks();
            }
        };

        window.addEventListener('new_notification', handleNewNotification);
        return () => window.removeEventListener('new_notification', handleNewNotification);
    }, []);

    // Отримуємо назву предмета
    const getSubjectName = (t: TaskStatus) => {
        if (!t.task) return "Інше";
        if (typeof t.task.subject_name === 'string') return t.task.subject_name;
        return "Інше";
    };

    // Групуємо завдання по предметах
    const groupedTasks = tasks.reduce((acc: Record<string, TaskStatus[]>, current) => {
        const subject = getSubjectName(current);
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(current);
        return acc;
    }, {});

    const selectTask = (statusObj: TaskStatus) => {
        if (selectedTask?.id === statusObj.id) {
            setSelectedTask(null);
            return;
        }
        setSelectedTask(statusObj);
    };

    return (
        <>
            <title>Quack | Архів</title>

            <div className={styles.container}>
                {!selectedSubject ? (
                    <>
                        {Object.keys(groupedTasks).map(subject => (
                            <div key={subject} className={styles.folderContainer} onClick={() => setSelectedSubject(subject)}>
                                <div className={styles.folder}>
                                    <div className={styles.back}>
                                        <svg width="180" height="173" viewBox="0 0 180 173" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M169.991 172.694H10C4.47715 172.694 0 168.217 0 162.694V10C0 4.47715 4.47716 0 10 0H57.6033C60.767 0 63.7442 1.49711 65.6308 4.03676L75.4433 17.246C77.3299 19.7856 80.307 21.2827 83.4707 21.2827H169.991C175.514 21.2827 179.991 25.7599 179.991 31.2827V162.694C179.991 168.217 175.514 172.694 169.991 172.694Z" fill="var(--color-main)" />
                                        </svg>
                                    </div>
                                    <div className={styles.shieets}>
                                        <FolderFront />
                                    </div>
                                    <div className={styles.front}>
                                        <div className={styles.subject}>{subject}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    // --- РЕЖИМ ЗАВДАНЬ В СЕРЕДИНІ ПАПКИ ---
                    <div className={styles.doneContainer}>
                        <div className={styles.doneTop} onClick={() => setSelectedSubject(null)}>
                            {SVG_ARROW_DOWN}
                            <div>Назад до папок</div>
                        </div>

                        <div className={taskStyles.container}>
                            {groupedTasks[selectedSubject].map(t => (
                                <TaskCard
                                    key={t.id}
                                    task={t.task}
                                    onClick={() => selectTask(t)}
                                    mark={(t.mark ?? 0)}
                                    selected={selectedTask?.task.id === t.task.id} 
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {selectedTask && (
                <TaskExtendedChecked
                    onCloseClick={() => setSelectedTask(null)}
                    task={selectedTask}
                />
            )}
        </>
    );
}

function FolderFront() {
    return <svg width="187" height="162" viewBox="0 0 187 162" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_103_316)">
            <rect width="147.85" height="103.096" transform="matrix(0.982462 0.186463 -0.182286 0.983245 30.0479 16.1191)" fill="#FBFBFB" />
        </g>
        <g filter="url(#filter1_d_103_316)">
            <rect width="147.788" height="103.138" transform="matrix(0.997744 0.0671323 -0.0644816 0.997919 21.0522 24.8719)" fill="#FBFBFB" />
        </g>
        <defs>
            <filter id="filter0_d_103_316" x="7.95488" y="13.8191" width="170.65" height="135.537" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dy="1" />
                <feGaussianBlur stdDeviation="1.65" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_103_316" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_103_316" result="shape" />
            </filter>
            <filter id="filter1_d_103_316" x="11.1019" y="22.5719" width="160.705" height="119.445" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dy="1" />
                <feGaussianBlur stdDeviation="1.65" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_103_316" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_103_316" result="shape" />
            </filter>
        </defs>
    </svg>
}