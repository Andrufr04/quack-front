import { useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import { apiRequest } from "../../../shared/api/api";
import { isStudent, isTeacher } from "../../../entities/session/lib/jwt";

interface LessonInfo {
    is_current: boolean;
    lesson: {
        subject: string;
        type: string;
        group: string;
        start: string;
        end: string;
        classroom: string;
        students: { id: string, name: string }[];
    };
}

export default function HomePage() {
    return <div>
        <title>Quack | Головна</title>
        {
            isStudent() ? <StudentPage />
            : isTeacher() ? <TeacherPage />
            : <></>
        }
    </div>
}

function StudentPage() {
    return <></>
}

function TeacherPage() {
    const [data, setData] = useState<LessonInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiRequest('/education/teacher/current-lesson/')
            .then(res => res?.json())
            .then(resData => {
                if (resData.lesson) setData(resData);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Завантаження...</div>;

    return (
        <div className={styles.container}>
            <title>Quack | Головна</title>

            {!data ? (
                <div className={styles.empty}>На сьогодні пар більше немає 🦆</div>
            ) : (
                <div className={styles.card}>
                    <div className={data.is_current ? styles.badgeNow : styles.badgeNext}>
                        {data.is_current ? "Зараз іде пара" : "Наступна пара"}
                    </div>

                    <h1 className={styles.title}>{data.lesson.subject}</h1>
                    <p className={styles.subtitle}>{data.lesson.type} • Гр. {data.lesson.group}</p>

                    <div className={styles.infoRow}>
                        <span>🕒 {new Date(data.lesson.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                            {new Date(data.lesson.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>📍 {data.lesson.classroom}</span>
                    </div>

                    <div className={styles.studentsSection}>
                        <h3>Список студентів ({data.lesson.students.length}):</h3>
                        <div className={styles.studentList}>
                            {data.lesson.students.map(s => (
                                <div key={s.id} className={styles.studentItem}>{s.name}</div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}