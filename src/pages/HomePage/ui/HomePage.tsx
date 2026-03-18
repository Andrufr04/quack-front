import { useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import { apiRequest } from "../../../shared/api/api";
import { isStudent, isTeacher } from "../../../entities/session/lib/jwt";
import { SVG_COIN, SVG_DUCK } from "../../../shared/ui/icons/icons";

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
    return <div className={styles.widgets}>
        <div className={styles.LeaderBoard}>
            <div className={styles.title}>Таблиця лідерів</div>
            <div className={styles.currency}>
                <div className={styles.balance}>
                    <div className={styles.iconDuck}>{SVG_DUCK}</div>
                    <div className={styles.amount}>100</div>
                </div>
                <div className={styles.balance}>
                    <div className={styles.iconCoin}>{SVG_COIN}</div>
                    <div className={styles.amount}>100</div>
                </div>
            </div>
            <div className={styles.list}>
                <div>1. Анна бебебебе</div>
                <div>2. Анна бебебебе</div>
                <div>3. Анна бебебебе</div>
                <div>4. Анна бебебебе</div>
                <div>5. Анна бебебебе</div>
                <div>6. Анна бебебебе</div>
                <div>1. Анна бебебебе</div>
                <div>2. Анна бебебебе</div>
                <div>3. Анна бебебебе</div>
                <div>4. Анна бебебебе</div>
                <div>5. Анна бебебебе</div>
                <div>6. Анна бебебебе</div>
                <div>1. Анна бебебебе</div>
                <div>2. Анна бебебебе</div>
                <div>3. Анна бебебебе</div>
                <div>4. Анна бебебебе</div>
                <div>5. Анна бебебебе</div>
                <div>6. Анна бебебебе</div>
            </div>
        </div>

        <div
            style={{
                background: "#fff",      // белый фон
                borderRadius: "15px",    // скругление
                padding: "16px",         // внутренние отступы
                width: "150px",          // можно под твой дизайн
                height: "150px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)", // лёгкая тень
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}
        >
            <div className={styles.title} >Середня оцінка</div>

            <div style={{ position: "relative", width: "100px", height: "100px", marginTop: "10px" }}>
                {/* Фон круга */}
                <svg width="100" height="100">
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#eee"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    {/* Прогресс */}
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#00cc66"
                        strokeWidth="8"
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - 4 / 12)}
                        transform="rotate(-90 50 50)"
                    />
                </svg>

                {/* Оценка внутри круга */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: "18px",
                    }}
                >
                    10.6
                </div>
            </div>
        </div>
    </div>
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