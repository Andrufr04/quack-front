import { useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import { apiRequest } from "../../../shared/api/api";
import { isAdministration, isCurator, isStudent, isTeacher } from "../../../entities/session/lib/jwt";
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

interface RecentGrade {
    id: string;
    type: string;
    grade: number;
    subject: string;
    theme: string;
    date: string;
}

interface StudentStats {
    leaderboard: LeaderboardUser[];
    my_stats: {
        ducks: number;
        coins: number;
        average_grade: number;
    };
    recent_grades?: RecentGrade[];
    group_name: string | null
}

interface AttendanceRecord {
    id: string;
    subject_name: string;
    date: string;
    status: number;
}

interface NewsItem {
    id: string;
    title: string;
    created_at: string;
}

interface CuratorData {
    group_name: string;
    students: {
        id: string;
        profile_id: string;
        full_name: string;
        lesson_avg: number;
        task_avg: number;
        lessons: Record<string, { attendance: number | null, grade: number | null }>;
        tasks: Record<string, { status: number, mark: number | null }>;
    }[];
    lessons_meta: { id: string, date: string, subject: string }[];
    tasks_meta: { id: string, deadline: string, subject: string }[];
}

export default function HomePage() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 767);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 767);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [])

    return <>
        <title>Quack | Головна</title>
        {
            isStudent() ? <StudentPage isMobile={isMobile} />
                : isTeacher() ? <TeacherPage isMobile={isMobile} />
                    : isCurator() ? <CuratorPage isMobile={isMobile} />
                        : isAdministration() ? <AdminPage isMobile={isMobile} /> : <></>
        }
    </>
}

function StudentPage({ isMobile }: { isMobile: boolean }) {
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [latestNews, setLatestNews] = useState<NewsItem | null>(null);
    const [taskStats, setTaskStats] = useState({ total: 0, urgent: 0, overdue: 0 });

    const fetchStats = () => {
        apiRequest('/education/student/dashboard-stats/')
            .then(res => res?.json())
            .then(data => setStats(data));
    };

    const fetchAttendance = () => {
        apiRequest('/education/student/attendance-history/?limit=60')
            .then(res => res?.json())
            .then(data => setAttendance(data))
            .finally(() => setLoading(false));
    };

    const fetchNews = async () => {
        const res = await apiRequest('/education/news/student/');
        if (res?.ok) {
            const data = await res.json();
            if (data && data.length > 0) setLatestNews(data[0]);
        }
    };

    const fetchTasksStats = async () => {
        const res = await apiRequest('/education/tasks/my-tasks/?status=0');
        if (res?.ok) {
            const data = await res.json();
            const now = new Date();
            let urgent = 0;
            let overdue = 0;

            data.forEach((t: any) => {
                const endDate = new Date(t.task.end);
                const diffMs = endDate.getTime() - now.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);

                if (diffHours < 0) overdue++;
                else if (diffHours <= 24) urgent++;
            });

            setTaskStats({ total: data.length, urgent, overdue });
        }
    };

    const fetchAllData = () => {
        fetchStats();
        fetchAttendance();
        fetchNews();
        fetchTasksStats();
        setLoading(false);
    };

    useEffect(() => {
        fetchAllData();

        const handleNewNotification = () => fetchAllData();
        window.addEventListener('new_notification', handleNewNotification);

        const intervalId = setInterval(fetchStats, 30000);

        return () => {
            window.removeEventListener('new_notification', handleNewNotification);
            clearInterval(intervalId);
        };
    }, []);

    const getStatusColor = (status: number) => {
        switch (status) {
            case 1: return "#00cc66";
            case 0: return "#ff4d4d";
            case 2: return "#ffcc00";
            default: return "var(--color-ui-widget-bg)";
        }
    };

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
        {/* 🔥 ВИКОРИСТОВУЄМО НОВИЙ GRID-КОНТЕЙНЕР 🔥 */}
        <div className={styles.studentGrid}>

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

            <div className={styles.attendanceWidget}>
                <div className={styles.title}>Присутність на парах (останні 60)</div>
                <div className={styles.activityGrid}>
                    {attendance.map((record) => (
                        <div
                            key={record.id}
                            className={styles.activitySquare}
                            style={{ backgroundColor: getStatusColor(record.status) }}
                            data-tooltip-id="my-tooltip"
                            data-tooltip-content={`${record.subject_name} | ${new Date(record.date).toLocaleDateString()} | ${getStatusText(record.status)}`}
                        ></div>
                    ))}
                    {Array.from({ length: Math.max(0, 60 - attendance.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className={styles.activitySquare} style={{ opacity: 0.2 }}></div>
                    ))}
                </div>
            </div>

            <div className={`${styles.widget} ${styles.avgGradeWidget}`}>
                <div className={styles.title} >Середня оцінка</div>

                <div className={styles.svgContainer}>
                    <svg viewBox="0 0 100 100" className={styles.svgChart}>
                        <circle cx="50" cy="50" r={radius} stroke="var(--color-ui-widget-bg)" strokeWidth="8" fill="transparent" />
                        <circle cx="50" cy="50" r={radius}
                            stroke={avgGrade >= 10 ? "#00cc66" : avgGrade >= 7 ? "#ffcc00" : "#ff4d4d"}
                            strokeWidth="8" fill="transparent" strokeLinecap="round"
                            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 0.5s ease" }}
                        />
                    </svg>
                    <div className={styles.gradeValue}>{avgGrade.toFixed(1)}</div>
                </div>
            </div>

            <Link to="/news" className={styles.newsWidget}>
                <div className={styles.newsTop}>
                    <div className={styles.newsTag}>Остання новина</div>
                    <div className={styles.newsTitle}>{latestNews ? latestNews.title : "Новин поки немає"}</div>
                </div>
                {latestNews && <div className={styles.newsDate}>{new Date(latestNews.created_at).toLocaleDateString()}</div>}
            </Link>

            <Link to="/tasks" className={styles.tasksWidget}>
                <div className={styles.title}>Домашні завдання</div>
                <div className={styles.tasksStats}>
                    <div style={{ display: "flex", gap: ".5em" }}>
                        <div className={styles.statBox}>
                            <span className={styles.statNum}>{taskStats.total}</span>
                            <span className={styles.statLabel}>Всього</span>
                        </div>
                        <div className={`${styles.statBox} ${styles.statUrgent}`}>
                            <span className={styles.statNum}>{taskStats.urgent}</span>
                            <span className={styles.statLabel}>Терміново</span>
                        </div>
                    </div>
                    <div className={`${styles.statBox} ${styles.statOverdue}`}>
                        <span className={styles.statNum}>{taskStats.overdue}</span>
                        <span className={styles.statLabel}>Прострочено</span>
                    </div>
                </div>
            </Link>

            <div className={styles.gradesWidget}>
                <div className={styles.title} style={{ marginBottom: "1em" }}>Останні оцінки</div>
                <div className={styles.gradesList}>
                    {stats?.recent_grades?.map(g => (
                        <div key={g.id} className={styles.gradeCard}>
                            <div className={`${styles.gradeMark} ${g.grade >= 10 ? styles.markHigh : g.grade >= 7 ? styles.markMid : styles.markLow}`}>
                                {g.grade}
                            </div>
                            <div className={styles.gradeInfo}>
                                <div className={styles.gradeSubject}>{g.subject}</div>
                                <div className={styles.gradeTheme}>{g.theme}</div>
                                <div className={styles.gradeDate}>{new Date(g.date).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))}
                    {(!stats?.recent_grades || stats.recent_grades.length === 0) && (
                        <div className={styles.emptyMsg}>Оцінок поки немає</div>
                    )}
                </div>
            </div>

        </div>

        {!isMobile && <div className={styles.calendar}>
            <CalendarSidebar
                isOpen={true}
                onClose={() => { }}
            />
        </div>}

    </div>
}

function TeacherPage({ isMobile }: { isMobile: boolean }) {
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
        {!isMobile && <div className={styles.calendar}>
            <CalendarSidebar
                isOpen={true}
                onClose={() => { }}
            />
        </div>}
    </div>);
}

function CuratorPage({ isMobile }: { isMobile: boolean }) {
    const [data, setData] = useState<CuratorData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'lessons' | 'tasks'>('lessons');

    useEffect(() => {
        apiRequest('/education/curator/dashboard-stats/')
            .then(res => res?.json())
            .then(resData => {
                if (!resData.error) setData(resData);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className={styles.loader}>Завантаження...</div>;
    if (!data) return <div className={styles.container}><div className={styles.emptyMsg}>Ви не закріплені як куратор жодної групи.</div></div>;

    const getAttendanceDot = (status: number | null) => {
        if (status === 1) return <span className={styles.attDot} style={{ background: '#00cc66' }} title="Присутній"></span>;
        if (status === 0) return <span className={styles.attDot} style={{ background: '#ff4d4d' }} title="Відсутній"></span>;
        if (status === 2) return <span className={styles.attDot} style={{ background: '#ffcc00' }} title="Запізнення"></span>;
        return <span className={styles.attDot} style={{ background: 'transparent', border: '1px solid var(--color-gray)' }}></span>;
    };

    const getTaskStatus = (status: number, mark: number | null) => {
        if (status === 2 && mark !== null) return <span className={styles.tMark}>{mark}</span>;
        if (status === 1) return <span className={styles.tStatus} style={{ color: '#ffcc00' }}>На перевірці</span>;
        return <span className={styles.tStatus} style={{ color: '#ff4d4d' }}>Не виконано</span>;
    };

    return (
        <div className={styles.container} style={{width: "100%"}}>
            <div className={styles.curatorWidget}>
                <div className={styles.curatorHeader}>
                    <div>
                        <h2 className={styles.curatorTitle}>Успішність групи {data.group_name}</h2>
                    </div>
                    <div className={styles.curatorTabs}>
                        <button className={`${styles.cTab} ${activeTab === 'lessons' ? styles.cTabActive : ''}`} onClick={() => setActiveTab('lessons')}>
                            Успішність (Пари)
                        </button>
                        <button className={`${styles.cTab} ${activeTab === 'tasks' ? styles.cTabActive : ''}`} onClick={() => setActiveTab('tasks')}>
                            Домашні завдання
                        </button>
                    </div>
                </div>

                <div className={styles.curatorTableWrapper}>
                    <table className={styles.cTable}>
                        <thead>
                            <tr>
                                <th className={`${styles.cStickyCol} ${styles.cZTop}`}>Студент</th>
                                <th className={styles.cStickyCol2}>Сер. бал</th>
                                {activeTab === 'lessons'
                                    ? data.lessons_meta.map(l => (
                                        <th key={l.id}>
                                            <div className={styles.thDate}>{new Date(l.date).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })}</div>
                                            <div className={styles.thSubj} data-tooltip-id="my-tooltip" data-tooltip-content={l.subject} data-tooltip-hidden={isMobile}>{l.subject}</div>
                                        </th>
                                    ))
                                    : data.tasks_meta.map(t => (
                                        <th key={t.id}>
                                            <div className={styles.thDate}>до {new Date(t.deadline).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })}</div>
                                            <div className={styles.thSubj} data-tooltip-id="my-tooltip" data-tooltip-content={t.subject} data-tooltip-hidden={isMobile}>{t.subject}</div>
                                        </th>
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {data.students.map((student, idx) => (
                                <tr key={student.profile_id} className={idx % 2 === 0 ? styles.cRowEven : ''}>
                                    <td className={styles.cStickyCol}>
                                        <Link to={`/profile/${student.profile_id}`} className={styles.cStudentLink}>
                                            {student.full_name}
                                        </Link>
                                    </td>
                                    <td className={styles.cStickyCol2}>
                                        <span className={styles.cAvgGrade}>
                                            {activeTab === 'lessons' ? student.lesson_avg : student.task_avg}
                                        </span>
                                    </td>
                                    {activeTab === 'lessons'
                                        ? data.lessons_meta.map(l => {
                                            const cell = student.lessons[l.id];
                                            return (
                                                <td key={l.id}>
                                                    <div className={styles.cCellContent}>
                                                        {getAttendanceDot(cell?.attendance)}
                                                        {cell?.grade ? <span className={styles.cGrade}>{cell.grade}</span> : <span style={{ opacity: 0.2 }}>-</span>}
                                                    </div>
                                                </td>
                                            );
                                        })
                                        : data.tasks_meta.map(t => {
                                            const cell = student.tasks[t.id];
                                            return (
                                                <td key={t.id}>
                                                    <div className={styles.cCellContent}>
                                                        {getTaskStatus(cell?.status || 0, cell?.mark || null)}
                                                    </div>
                                                </td>
                                            );
                                        })
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// 🔥 НОВИЙ КОМПОНЕНТ АДМІНІСТРАТОРА 🔥
function AdminPage({ isMobile }: { isMobile: boolean }) {
    const [data, setData] = useState<CuratorData | null>(null);
    const [groups, setGroups] = useState<{ id: string, name: string }[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'lessons' | 'tasks'>('lessons');

    // 1. Завантажуємо список усіх груп
    useEffect(() => {
        apiRequest('/education/all-groups/')
            .then(res => res?.json())
            .then(resData => {
                if (resData && resData.length > 0) {
                    setGroups(resData);
                    setSelectedGroup(resData[0].id); // Обираємо першу групу за замовчуванням
                }
                setLoading(false);
            });
    }, []);

    // 2. Завантажуємо статистику при зміні групи
    useEffect(() => {
        if (!selectedGroup) return;
        
        setLoading(true);
        apiRequest(`/education/admin/dashboard-stats/?group_id=${selectedGroup}`)
            .then(res => res?.json())
            .then(resData => {
                if (!resData.error) setData(resData);
                else setData(null);
            })
            .finally(() => setLoading(false));
    }, [selectedGroup]);

    const getAttendanceDot = (status: number | null) => {
        if (status === 1) return <span className={styles.attDot} style={{ background: '#00cc66' }} title="Присутній"></span>;
        if (status === 0) return <span className={styles.attDot} style={{ background: '#ff4d4d' }} title="Відсутній"></span>;
        if (status === 2) return <span className={styles.attDot} style={{ background: '#ffcc00' }} title="Запізнення"></span>;
        return <span className={styles.attDot} style={{ background: 'transparent', border: '1px solid var(--color-gray)' }}></span>;
    };

    const getTaskStatus = (status: number, mark: number | null) => {
        if (status === 2 && mark !== null) return <span className={styles.tMark}>{mark}</span>;
        if (status === 1) return <span className={styles.tStatus} style={{ color: '#ffcc00' }}>На перевірці</span>;
        return <span className={styles.tStatus} style={{ color: '#ff4d4d' }}>Не виконано</span>;
    };

    if (loading && groups.length === 0) return <div className={styles.loader}>Завантаження...</div>;

    return (
        <div className={styles.container} style={{ width: "100%" }}>
            <div className={styles.curatorWidget}>
                
                <div className={styles.curatorHeader}>
                    <div>
                        <h2 className={styles.curatorTitle}>Успішність групи</h2>
                        {/* 🔥 СЕЛЕКТОР ГРУПИ 🔥 */}
                        <select 
                            className={styles.adminGroupSelect} 
                            value={selectedGroup} 
                            onChange={(e) => setSelectedGroup(e.target.value)}
                        >
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.curatorTabs}>
                        <button className={`${styles.cTab} ${activeTab === 'lessons' ? styles.cTabActive : ''}`} onClick={() => setActiveTab('lessons')}>
                            Успішність (Пари)
                        </button>
                        <button className={`${styles.cTab} ${activeTab === 'tasks' ? styles.cTabActive : ''}`} onClick={() => setActiveTab('tasks')}>
                            Домашні завдання
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '2em', textAlign: 'center', color: 'var(--color-grey)' }}>Оновлення даних...</div>
                ) : !data ? (
                    <div className={styles.emptyMsg}>Немає даних для цієї групи.</div>
                ) : (
                    <div className={styles.curatorTableWrapper}>
                        <table className={styles.cTable}>
                            <thead>
                                <tr>
                                    <th className={`${styles.cStickyCol} ${styles.cZTop}`}>Студент</th>
                                    <th className={styles.cStickyCol2}>Сер. бал</th>
                                    {activeTab === 'lessons'
                                        ? data.lessons_meta.map(l => (
                                            <th key={l.id}>
                                                <div className={styles.thDate}>{new Date(l.date).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })}</div>
                                                <div className={styles.thSubj} data-tooltip-id="my-tooltip" data-tooltip-content={l.subject} data-tooltip-hidden={isMobile}>{l.subject}</div>
                                            </th>
                                        ))
                                        : data.tasks_meta.map(t => (
                                            <th key={t.id}>
                                                <div className={styles.thDate}>до {new Date(t.deadline).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })}</div>
                                                <div className={styles.thSubj} data-tooltip-id="my-tooltip" data-tooltip-content={t.subject} data-tooltip-hidden={isMobile}>{t.subject}</div>
                                            </th>
                                        ))
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {data.students.map((student, idx) => (
                                    <tr key={student.profile_id} className={idx % 2 === 0 ? styles.cRowEven : ''}>
                                        <td className={styles.cStickyCol}>
                                            <Link to={`/profile/${student.profile_id}`} className={styles.cStudentLink}>
                                                {student.full_name}
                                            </Link>
                                        </td>
                                        <td className={styles.cStickyCol2}>
                                            <span className={styles.cAvgGrade}>
                                                {activeTab === 'lessons' ? student.lesson_avg : student.task_avg}
                                            </span>
                                        </td>
                                        {activeTab === 'lessons'
                                            ? data.lessons_meta.map(l => {
                                                const cell = student.lessons[l.id];
                                                return (
                                                    <td key={l.id}>
                                                        <div className={styles.cCellContent}>
                                                            {getAttendanceDot(cell?.attendance)}
                                                            {cell?.grade ? <span className={styles.cGrade}>{cell.grade}</span> : <span style={{ opacity: 0.2 }}>-</span>}
                                                        </div>
                                                    </td>
                                                );
                                            })
                                            : data.tasks_meta.map(t => {
                                                const cell = student.tasks[t.id];
                                                return (
                                                    <td key={t.id}>
                                                        <div className={styles.cCellContent}>
                                                            {getTaskStatus(cell?.status || 0, cell?.mark || null)}
                                                        </div>
                                                    </td>
                                                );
                                            })
                                        }
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}