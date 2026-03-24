import { useState, useEffect } from "react";
import styles from "./ManageLessons.module.css";
import { SVG_DUCK } from "../../../shared/ui/icons/icons";
import { apiRequest } from "../../../shared/api/api";
import { isTeacher } from "../../../entities/session/lib/jwt";
import Page403 from "../../Page403/ui/Page403";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ManageLesson() {
    if (!isTeacher()) return <Page403 />
    const navigate = useNavigate();

    const [lessons, setLessons] = useState<any[]>([]);
    const [currentTab, setCurrentTab] = useState<number | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [topic, setTopic] = useState("");
    const [loading, setLoading] = useState(true);

    const maxChars = 200;

    // 1. Завантаження пар на сьогодні
    useEffect(() => {
        const fetchLessons = async () => {
            const res = await apiRequest('/education/teacher/lessons-today/');
            const data = await res?.json();
            if (data) {
                setLessons(data);

                // Визначаємо поточну пару за часом
                const now = new Date();
                const activeIdx = data.findIndex((l: any) => {
                    const start = new Date(l.start_time);
                    const end = new Date(l.end_time);
                    return now >= start && now <= end;
                });
                setCurrentTab(activeIdx !== -1 ? activeIdx : 0);
            }
            setLoading(false);
        };
        fetchLessons();
    }, []);

    // 2. Завантаження студентів при зміні вкладки (пари)
    useEffect(() => {
        if (currentTab !== null && lessons[currentTab]) {
            const lessonId = lessons[currentTab].id;
            apiRequest(`/education/lessons/${lessonId}/students/`)
                .then(res => res?.json())
                .then(data => {
                    setStudents(data.students);
                    setTopic(lessons[currentTab].theme || "");
                });
        }
    }, [currentTab, lessons]);

    const handleAttendance = async (studentId: string, status: number) => {
        const lessonId = lessons[currentTab!].id;
        const res = await apiRequest(`/education/attendance/`, {
            method: 'POST',
            body: JSON.stringify({ lesson_id: lessonId, student_id: studentId, status })
        });
        if (res?.ok) {
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance_status: status } : s));
        } else {
            const errorData = await res?.json();
            if (errorData?.error === "badtime") {
                toast.error("Пара ще не почалась!");
            }
        }
    };

    const handleGrade = async (studentId: string, grade: number) => {
        if (currentTab === null) return;
        const lessonId = lessons[currentTab].id;

        const res = await apiRequest(`/education/grade-student/`, {
            method: 'POST',
            body: JSON.stringify({ lesson_id: lessonId, student_id: studentId, grade })
        });

        if (res?.ok) {
            // Оновлюємо стан, щоб селект відразу показав нову оцінку
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, grade } : s));
            toast.success("Оцінку виставлено");
        } else {
            const errorData = await res?.json();
            if (errorData?.error === "badtime") {
                toast.error("Пара ще не почалась!");
            }
        }
    };

    // Функція перемикання заохочення
    const toggleDuck = async (studentId: string) => {
        if (currentTab === null) return;
        const lessonId = lessons[currentTab].id;

        const res = await apiRequest(`/education/lessons/${lessonId}/students/${studentId}/toggle-duck/`, {
            method: 'POST'
        });

        if (res?.ok) {
            const result = await res.json();
            setStudents(prev => prev.map(s =>
                s.id === studentId ? { ...s, duck_active: result.active } : s
            ));
        } else {
            const errorData = await res?.json();
            if (errorData?.error === "badtime") {
                toast.error("Пара ще не почалась!");
            }
        }
    };

    // Функція збереження теми (onBlur)
    const saveTheme = async () => {
        if (currentTab === null) return;
        const lessonId = lessons[currentTab].id;

        await apiRequest(`/education/lessons/${lessonId}/update-theme/`, {
            method: 'POST',
            body: JSON.stringify({ theme: topic })
        });

        // Оновлюємо локальний стан списку пар, щоб при перемиканні вкладок тема була актуальна
        setLessons(prev => prev.map((l, idx) => idx === currentTab ? { ...l, theme: topic } : l));
    };

    const handleGoToTasks = () => {
        if (currentTab === null || !lessons[currentTab]) return;

        const lesson = lessons[currentTab];

        navigate("/managetasks", {
            state: {
                groupId: lesson.study_group,  
                subjectId: lesson.subject,    
                theme: topic || lesson.theme, 
            }
        });
    };

    return (
        <div className={styles.container}>
            {/* Вкладка */}
            <div className={styles.tabs}>
                {lessons.map((l, idx) => (
                    <div
                        key={l.id}
                        className={`${styles.tab} ${currentTab === idx ? styles.tabActive : ""}`}
                        onClick={() => setCurrentTab(idx)}
                    >
                        {new Date(l.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        -
                        {new Date(l.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {l.study_group_name}
                    </div>
                ))}
            </div>

            {/* Поле тема + кнопка */}
            <div className={styles.header}>
                <div className={styles.topicWrapper}>
                    <input
                        type="text"
                        className={styles.topicInput}
                        placeholder="Введіть тему заняття"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onBlur={saveTheme}
                        maxLength={maxChars}
                    />
                    <span className={`${styles.charCounter} ${topic.length > maxChars ? styles.exceed : ""}`}>
                        {topic.length}/{maxChars}
                    </span>
                </div>

                <button className={styles.topicButton} onClick={handleGoToTasks}>Завантажити завдання</button>
            </div>

            {/* Таблиця */}
            <div className={styles.tableWrapper}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Студент</th>
                                <th>Присутність</th>
                                <th>Оцінка</th>
                                <th>Заохочення</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s, idx) => (
                                <tr key={s.id}>
                                    <td>{idx + 1}</td>
                                    <td>{s.full_name}</td>
                                    <td>
                                        <div className={styles.attendanceRow}>
                                            <div className={`${styles.attBox} ${styles.green} ${s.attendance_status === 1 ? styles.active : ""}`} onClick={() => handleAttendance(s.id, 1)}></div>
                                            <div className={`${styles.attBox} ${styles.yellow} ${s.attendance_status === 2 ? styles.active : ""}`} onClick={() => handleAttendance(s.id, 2)}></div>
                                            <div className={`${styles.attBox} ${styles.red} ${s.attendance_status === 0 ? styles.active : ""}`} onClick={() => handleAttendance(s.id, 0)}></div>
                                        </div>
                                    </td>
                                    <td>
                                        <select
                                            className={styles.mark}
                                            value={s.grade || ""}
                                            onChange={(e) => handleGrade(s.id, Number(e.target.value))}
                                        >
                                            <option value="">-</option>
                                            {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                                        </select>
                                    </td>
                                    <td className={s.duck_active ? styles.iconActive : styles.icon} onClick={() => toggleDuck(s.id)}>
                                        {SVG_DUCK}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
