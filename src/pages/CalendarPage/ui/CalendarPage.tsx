import { SVG_ARROW_DOWN } from "../../../shared/ui/icons/icons";
import RoundButton from "../../../shared/ui/RoundButton/RoundButton";
import styles from "./CalendarPage.module.css";
import { useRef, useEffect, useState } from "react";

const START_DAY = 8 * 60; // 08:00
const END_DAY = 20 * 60;  // например до 20:00

const TOTAL_MINUTES = END_DAY - START_DAY;
const PX_PER_MINUTE = 1; // можна 1.2 / 0.8 підлаштувати

export type Lesson = {
    id: string;
    title: string;
    start: string; // "10:20"
    end: string;   // "11:40"
    day: number;   // 0-6
};

const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

const lessons: Lesson[] = [
    {
        id: "1",
        title: "Фізика",
        start: "10:20",
        end: "19:40",
        day: 3,
    },
    {
        id: "2",
        title: "Фізика csdjfha;shd;fjea",
        start: "8:00",
        end: "8:30",
        day: 2,
    },
    {
        id: "5",
        title: "Фізика csdjfha;shd;fjea",
        start: "14:00",
        end: "15:30",
        day: 5,
    },
];


type Props = {
    lessons: Lesson[];
};

export const CalendarPage = () => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [pxPerMinute, setPxPerMinute] = useState(1);

    useEffect(() => {
        if (wrapperRef.current) {
            const height = wrapperRef.current.clientHeight;
            setPxPerMinute((height / TOTAL_MINUTES) * 2.5);
        }
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.iconNext}><RoundButton button={{icon: SVG_ARROW_DOWN, text: "Наступний тиждень"}} /></div>
            <div className={styles.calendar}>
                <div className={styles.days}>
                    <div className={`${styles.day} ${styles.weekend}`}>
                        <div className={styles.dayOfWeek}>Неділя</div>
                        <div className={styles.date}>13</div>
                    </div>
                    <div className={styles.day}>
                        <div className={styles.dayOfWeek}>Понеділок</div>
                        <div className={styles.date}>13</div>
                    </div>
                    <div className={styles.day}>
                        <div className={styles.dayOfWeek}>Вівторок</div>
                        <div className={styles.date}>13</div>
                    </div>
                    <div className={styles.day}>
                        <div className={styles.dayOfWeek}>Середа</div>
                        <div className={styles.date}>13</div>
                    </div>
                    <div className={styles.day}>
                        <div className={styles.dayOfWeek}>Четверг</div>
                        <div className={styles.date}>13</div>
                    </div>
                    <div className={styles.day}>
                        <div className={styles.dayOfWeek}>П'ятниця</div>
                        <div className={styles.date}>13</div>
                    </div>
                    <div className={`${styles.weekend} ${styles.day}`}>
                        <div className={styles.dayOfWeek}>Субота</div>
                        <div className={styles.date}>13</div>
                    </div>
                </div>


                <div className={styles.wrapper} ref={wrapperRef}>
                    {/* Ліва колонка з часом */}
                    <div className={styles.timeColumn}>
                        {Array.from({ length: 12 }).map((_, i) => {
                            const hour = 8 + i;
                            return <div key={i}>{hour}:00</div>;
                        })}
                    </div>

                    {/* Дні */}
                    <div className={styles.grid}>
                        {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                            <div key={day} className={styles.dayColumn}>
                                {lessons
                                    .filter(l => l.day === day)
                                    .map((lesson) => {
                                        const start = timeToMinutes(lesson.start);
                                        const end = timeToMinutes(lesson.end);

                                        const top = (start - START_DAY) * pxPerMinute;
                                        const height = (end - start) * pxPerMinute;

                                        return (
                                            <div
                                                key={lesson.id}
                                                className={styles.lesson}
                                                style={{
                                                    top,
                                                    height,
                                                }}
                                            >
                                                <div className={styles.title}>{lesson.title}</div>
                                                <div>{lesson.start} - {lesson.end}</div>
                                            </div>
                                        );
                                    })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className={styles.iconPrevious}><RoundButton button={{icon: SVG_ARROW_DOWN, text: "Наступний тиждень"}} /></div>
        </div>
    );
};
