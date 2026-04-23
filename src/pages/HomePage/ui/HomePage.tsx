import { useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import { apiRequest } from "../../../shared/api/api";
import { isStudent, isTeacher } from "../../../entities/session/lib/jwt";
import { SVG_COIN, SVG_DUCK } from "../../../shared/ui/icons/icons";
import { isDark } from "../../../shared/lib/localStorage";
import { Link } from "react-router-dom";
import CalendarSidebar from "../../../shared/ui/CalendarSidebar/ui/CalendarSidebar";

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

interface LeaderboardUser {
    id: string;
    full_name: string;
    ducks: number;
    coins: number;
    total_points: number;
}

interface StudentStats {
    leaderboard: LeaderboardUser[];
    my_stats: {
        ducks: number;
        coins: number;
        average_grade: number;
    };
    group_name: string | null
}

interface AttendanceRecord {
    id: string;
    subject_name: string;
    date: string;
    status: number; // 0 - нб, 1 - є, 2 - запізнення
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
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

    const fetchStats = () => {
        apiRequest('/education/student/dashboard-stats/')
            .then(res => res?.json())
            .then(data => setStats(data));

        apiRequest('/education/student/attendance-history/?limit=80')
            .then(res => res?.json())
            .then(data => setAttendance(data))
            .finally(() => setLoading(false));
    };

    const fetchAttendance = () => {
        apiRequest('/education/student/attendance-history/?limit=40')
            .then(res => res?.json())
            .then(data => setAttendance(data));
    };

    // 🔥 Об'єднуємо обидві функції
    const fetchAllData = () => {
        fetchStats();
        fetchAttendance();
        setLoading(false); // Вимикаємо лоадер після запитів
    };

    useEffect(() => {
        // Завантажуємо при старті
        fetchAllData();

        // 🔥 2. Слухаємо вебсокет: якщо прийшло сповіщення МЕНІ, миттєво оновлюємо статуси
        const handleNewNotification = () => fetchAllData();
        window.addEventListener('new_notification', handleNewNotification);

        // 🔥 3. Тихе фонове оновлення кожні 30 сек (для оновлення балів ІНШИХ студентів)
        const intervalId = setInterval(fetchStats, 30000);

        // Прибираємо слухачі, коли компонент зникає
        return () => {
            window.removeEventListener('new_notification', handleNewNotification);
            clearInterval(intervalId);
        };
    }, []);

    const getStatusColor = (status: number) => {
        switch (status) {
            case 1: return "#00cc66"; // Зелений (Присутній)
            case 0: return "#ff4d4d"; // Червоний (Відсутній)
            case 2: return "#ffcc00"; // Жовтий (Запізнився)
            default: return "var(--color-ui-widget-bg)";
        }
    };

    // Функція для тексту статусу в тултіп
    const getStatusText = (status: number) => {
        if (status === 1) return "Присутній";
        if (status === 0) return "Відсутній";
        return "Запізнення";
    };

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const avgGrade = stats?.my_stats.average_grade || 0;
    const strokeDashoffset = circumference * (1 - avgGrade / 12);

    return <div className={styles.container}>
        <div className={styles.widgets}>
            {stats?.group_name && <div className={styles.LeaderBoard}>
                <div className={styles.title}>Таблиця лідерів</div>
                <div className={styles.currency}>
                    <div className={styles.balance}>
                        <div className={styles.iconDuck}>{SVG_DUCK}</div>
                        <div className={styles.amount}>{stats?.my_stats.ducks || 0}</div>
                    </div>
                    <div className={styles.balance}>
                        <div className={styles.iconCoin}>{SVG_COIN}</div>
                        <div className={styles.amount}>{stats?.my_stats.coins || 0}</div>
                    </div>
                </div>
                <div className={styles.list}>
                    {stats?.leaderboard.map((user, index) => (
                        <div key={user.id} className={`${isDark() ? styles.dark : ""} ${styles.personLeaderboard}`}>
                            {index + 1}. <Link to={`/profile/${user.id}`} className={isDark() ? styles.userDark : styles.user}>{user.full_name}</Link>
                            <span className={styles.leaderScore}>
                                ({user.total_points})
                            </span>
                        </div>
                    ))}
                </div>
            </div>}

            <div className={styles.widget} style={{ width: "150px", height: "150px" }}>
                <div className={styles.title} >Середня оцінка</div>

                <div style={{ position: "relative", width: "100px", height: "100px", marginTop: "10px" }}>
                    {/* Фон круга */}
                    <svg width="100" height="100">
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            stroke="var(--color-ui-widget-bg)"
                            strokeWidth="8"
                            fill="transparent"
                        />
                        {/* Прогресс */}
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            stroke={avgGrade >= 10 ? "#00cc66" : avgGrade >= 7 ? "#ffcc00" : "#ff4d4d"}
                            strokeWidth="8"
                            fill="transparent"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 50 50)"
                            style={{ transition: "stroke-dashoffset 0.5s ease" }}
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
                        {avgGrade.toFixed(1)}
                    </div>
                </div>
            </div>

            <div className={styles.attendanceWidget}>
                <div className={styles.title}>Присутність на парах (останні 80)</div>
                <div className={styles.activityGrid}>
                    {attendance.map((record) => (
                        <div
                            key={record.id}
                            className={styles.activitySquare}
                            style={{ backgroundColor: getStatusColor(record.status) }}
                            // Використовуємо react-tooltip, який у тебе вже підключений в AppRouter
                            data-tooltip-id="my-tooltip"
                            data-tooltip-content={`${record.subject_name} | ${new Date(record.date).toLocaleDateString()} | ${getStatusText(record.status)}`}
                        ></div>
                    ))}
                    {/* Заповнюємо порожніми квадратами, якщо пар менше 80 */}
                    {Array.from({ length: Math.max(0, 80 - attendance.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className={styles.activitySquare} style={{ opacity: 0.2 }}></div>
                    ))}
                </div>
            </div>
        </div>
        <div className={styles.calendar}>
            <CalendarSidebar
                isOpen={true}
                onClose={() => { }}
            />
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

    if (loading) return <div className={styles.loader}>Завантаження...</div>;

    return (<div className={styles.container}>
        <div className={styles.widgets}>
            {!data ? (
                <div className={styles.emptyWidget}>
                    <div className={styles.duckIconLarge}>{SVG_DUCK}</div>
                    <p>На сьогодні пар більше немає</p>
                </div>
            ) : (
                <div className={styles.teacherLessonCard}>
                    <div className={styles.cardHeader}>
                        <span className={data.is_current ? styles.statusNow : styles.statusNext}>
                            {data.is_current ? "• Прямо зараз" : "Наступна"}
                        </span>
                        <span className={styles.classroomBadge}>{data.lesson.classroom}</span>
                    </div>

                    <div className={styles.mainInfo}>
                        <h2 className={styles.subjectTitle}>{data.lesson.subject}</h2>
                        <div className={styles.typeTag}>{data.lesson.type}</div>
                    </div>

                    <div className={styles.detailsRow}>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Група</span>
                            <span className={styles.value}>{data.lesson.group}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Час</span>
                            <span className={styles.value}>
                                {new Date(data.lesson.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                -
                                {new Date(data.lesson.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <div className={styles.studentsWidget}>
                        <div className={styles.studentsHeader}>
                            <span>Студенти</span>
                            <div className={styles.studentsAmount}>{data.lesson.students.length}</div>
                        </div>
                        <div className={styles.miniStudentList}>
                            {data.lesson.students.slice(0, 5).map(s => (
                                <div key={s.id} className={styles.miniStudentItem}>
                                    {s.name}
                                </div>
                            ))}
                            {data.lesson.students.length > 5 && (
                                <div className={styles.moreStudents}>+{data.lesson.students.length - 5}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
        <div className={styles.calendar}>
            <CalendarSidebar
                isOpen={true}
                onClose={() => { }}
            />
        </div>
    </div>);
}