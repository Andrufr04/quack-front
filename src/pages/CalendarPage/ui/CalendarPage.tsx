import { isStudent, isTeacher } from "../../../entities/session/lib/jwt";
import { SVG_ARROW_DOWN } from "../../../shared/ui/icons/icons";
import RoundButton from "../../../shared/ui/RoundButton/RoundButton";
import Page403 from "../../Page403/ui/Page403";
import styles from "./CalendarPage.module.css";
import { useRef, useEffect, useState } from "react";
import { apiRequest } from "../../../shared/api/api";
import { useNavigate } from "react-router-dom";

const START_DAY = 8 * 60;
const END_DAY = 20 * 60;

export type Lesson = {
    id: string;
    title: string;
    type: string;
    start: string;
    end: string;
    day: number;
    date: string;
    classroom: string;
    teacher_id: string;
};

const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

const getLocalDateString = (dateObj: Date = new Date()) => {
    const d = new Date(dateObj);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

const MONTH_SHORT_NAMES: Record<number, string> = {
    0: "січ", // Січень
    1: "лют", // Лютий
    2: "бер", // Березень
    3: "квіт", // Квітень
    4: "трав", // Травень
    5: "черв", // Червень
    6: "лип", // Липень
    7: "серп", // Серпень
    8: "вер", // Вересень
    9: "жовт", // Жовтень
    10: "лист", // Листопад
    11: "груд", // Грудень
};

export const CalendarPage = () => {
    if (!isStudent() && !isTeacher()) return <Page403 />;

    const wrapperRef = useRef<HTMLDivElement>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date()); // Стан поточного тижня
    const [weekDays, setWeekDays] = useState<{ name: string, date: number, fullDate: string }[]>([]);
    const [nowMinutes, setNowMinutes] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const updateNow = () => {
            const now = new Date();
            const minutes = now.getHours() * 60 + now.getMinutes();
            // Відображаємо лінію лише якщо зараз робочий час календаря
            if (minutes >= START_DAY && minutes <= END_DAY) {
                setNowMinutes(minutes);
            } else {
                setNowMinutes(null);
            }
        };

        updateNow();
        const interval = setInterval(updateNow, 60000); // Оновлюємо щохвилини
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const start = new Date(currentDate);
        start.setDate(currentDate.getDate() - currentDate.getDay()); // Знаходимо неділю

        const days = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];
        const week = days.map((name, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return {
                name,
                date: d.getDate(),
                fullDate: getLocalDateString(d) 
            };
        });
        setWeekDays(week);
        fetchLessons(week[0].fullDate); // Тягнемо дані для цього тижня
    }, [currentDate]);

    const getYear = () => {
        if (!weekDays.length) return "";

        const lastDay = new Date(weekDays[6].fullDate);
        const year = lastDay.getFullYear();

        return `${year}`;
    };

    const getCalendarHeader = () => {
        if (!weekDays.length) return "";

        const firstDay = new Date(weekDays[0].fullDate);
        const lastDay = new Date(weekDays[6].fullDate);

        const firstMonthIdx = firstDay.getMonth();
        const lastMonthIdx = lastDay.getMonth();

        // Отримуємо скорочення зі словника
        const firstMonthStr = MONTH_SHORT_NAMES[firstMonthIdx];

        if (firstMonthIdx !== lastMonthIdx) {
            const lastMonthStr = MONTH_SHORT_NAMES[lastMonthIdx];
            // Формат: січ - лют 2026
            return `${firstMonthStr}-${lastMonthStr}`;
        }

        // Формат: січ 2026
        return `${firstMonthStr}`;
    };

    const fetchLessons = async (date: string) => {
        const res = await apiRequest(`/education/calendar/lessons/?date=${date}`);
        if (res.ok) {
            const data = await res.json();
            setLessons(data);
        }
    };

    const changeWeek = (direction: number) => {
        const next = new Date(currentDate);
        next.setDate(currentDate.getDate() + (direction * 7));
        setCurrentDate(next);
    };

    const pxPerMinute = 1.2;

    const onLessonClick = (lesson: Lesson) => {
        if (isTeacher()) {
            navigate(`/managelesson/${lesson.date}`)
        }
    }

    return (
        <div className={styles.container}>
            {/* Кнопка Назад (повертаємо іконку вгору через стиль) */}
            <div className={styles.iconPrevious} onClick={() => changeWeek(-1)}>
                <RoundButton button={{ icon: SVG_ARROW_DOWN, text: "Минулий тиждень" }} />
            </div>

            <div className={styles.calendar}>
                <div className={styles.days}>
                    <div className={styles.headerInfo}>
                        <div>{getCalendarHeader()}</div>
                        <div className={styles.year}>{getYear()}</div>
                    </div>

                    {weekDays.map((day, idx) => (
                        <div key={idx} className={`${styles.day} ${idx === 0 || idx === 6 ? styles.weekend : ""}`}>
                            <div className={styles.dayOfWeek}>{day.name}</div>
                            <div className={styles.date}>{day.date}</div>
                        </div>
                    ))}
                </div>

                <div className={styles.wrapper} ref={wrapperRef}>
                    {/* ТУТ МИ РОБИМО ФОНОВУ СІТКУ */}
                    <div className={styles.backgroundGrid}>
                        {Array.from({ length: 13 }).map((_, i) => (
                            <div key={i} className={styles.gridRow} style={{ height: `${60 * pxPerMinute}px` }}>
                                <div className={styles.timeLabel}>{8 + i}:00</div>
                                <div className={styles.gridLine}></div>
                            </div>
                        ))}
                    </div>

                    {/* ТУТ РОЗМІЩУЮТЬСЯ КАРТКИ */}
                    <div className={styles.eventsGrid}>
                        {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                            // Дістаємо точну дату цієї колонки
                            const columnDate = weekDays[dayIdx]?.fullDate;

                            return (
                                <div key={dayIdx} className={styles.dayColumn}>
                                    {lessons
                                        // 🔥 Броня: тепер пара стане тільки в свою точну дату
                                        .filter(l => l.date === columnDate)
                                        .map((lesson) => {
                                            const startMin = timeToMinutes(lesson.start);
                                            const endMin = timeToMinutes(lesson.end);
                                            const top = (startMin - START_DAY) * pxPerMinute;
                                            const height = (endMin - startMin) * pxPerMinute;

                                            const todayStr = getLocalDateString();
                                            const isActive =
                                                columnDate === todayStr && 
                                                nowMinutes !== null &&     
                                                nowMinutes >= startMin &&  
                                                nowMinutes < endMin;       

                                            return (
                                                <div 
                                                    key={lesson.id} 
                                                    className={`${styles.lesson} ${isActive ? styles.activeLesson : ""}`}
                                                    style={{ top, height, cursor: isTeacher() ? "pointer" : "" }}
                                                    onClick={() => onLessonClick(lesson)}
                                                >
                                                    <div className={styles.title}>{lesson.title}</div>
                                                    <div className={styles.lessonBottom}>
                                                        <div>{lesson.start} - {lesson.end}</div>
                                                        <div className={styles.aud}>{lesson.classroom}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Кнопка Вперед */}
            <div className={styles.iconNext} onClick={() => changeWeek(1)}>
                <RoundButton button={{ icon: SVG_ARROW_DOWN, text: "Наступний тиждень" }} />
            </div>
        </div>
    );
};