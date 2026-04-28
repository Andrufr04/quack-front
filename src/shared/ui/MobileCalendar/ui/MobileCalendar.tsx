import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './MobileCalendar.module.css';
import { SVG_PLUS, SVG_ARROW_DOWN, SVG_CHATS } from '../../icons/icons';
import { apiRequest } from '../../../api/api';
import { isStudent } from '../../../../entities/session/lib/jwt';

interface MobileCalendarProps {
    isOpen: boolean;
    onClose: () => void;
}

export type Lesson = {
    id: string; title: string; type: string; start: string; end: string;
    date: string; classroom?: string; teacher_id?: string;
};

const getLocalDateString = (dateObj: Date = new Date()) => {
    const d = new Date(dateObj);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

const timeToMinutes = (time: string) => {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

const MONTH_FULL_NAMES = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
];

export default function MobileCalendar({ isOpen, onClose }: MobileCalendarProps) {
    const today = new Date();
    const navigate = useNavigate();
    
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [schedule, setSchedule] = useState<Lesson[]>([]);
    const [nowMinutes, setNowMinutes] = useState<number>(0);

    const daysOfWeek = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    useEffect(() => {
        if (!isOpen) return;
        const updateNow = () => {
            const now = new Date();
            setNowMinutes(now.getHours() * 60 + now.getMinutes());
        };
        updateNow();
        const interval = setInterval(updateNow, 60000);
        return () => clearInterval(interval);
    }, [isOpen]);

    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        const days = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.unshift({ day: daysInPrevMonth - i, current: false, dateStr: getLocalDateString(new Date(year, month - 1, daysInPrevMonth - i)) });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, current: true, dateStr: getLocalDateString(new Date(year, month, i)) });
        }
        let nextDay = 1;
        while (days.length < 42) {
            days.push({ day: nextDay, current: false, dateStr: getLocalDateString(new Date(year, month + 1, nextDay)) });
            nextDay++;
        }
        return days;
    }, [viewDate]);

    useEffect(() => {
        if (!isOpen) return;
        const fetchSchedule = async () => {
            const dateStr = getLocalDateString(selectedDate);
            const res = await apiRequest(`/education/calendar/lessons/?date=${dateStr}`);
            if (res?.ok) {
                const data = await res.json();
                const dayLessons = data.filter((l: any) => l.date === dateStr);
                dayLessons.sort((a: any, b: any) => a.start.localeCompare(b.start));
                setSchedule(dayLessons);
            }
        };
        fetchSchedule();
        const handleNewNotification = () => fetchSchedule();
        window.addEventListener('new_notification', handleNewNotification);
        const intervalId = setInterval(fetchSchedule, 60000);
        return () => {
            window.removeEventListener('new_notification', handleNewNotification);
            clearInterval(intervalId);
        };
    }, [selectedDate, isOpen]);

    const formatClassroom = (room: string | undefined) => {
        if (!room) return "Онлайн";
        const isNumberOnly = /^\d+$/.test(room.trim());
        return isNumberOnly ? `Ауд. ${room}` : room;
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(viewDate.getMonth() + offset);
        setViewDate(newDate);
    };

    const handleDayClick = (item: any) => {
        const clickedDate = new Date(item.dateStr);
        setSelectedDate(clickedDate);
        if (!item.current) {
            setViewDate(new Date(clickedDate.getFullYear(), clickedDate.getMonth(), 1));
        }
    };

    const handleStartChat = async (teacherId: string) => {
        try {
            const res = await apiRequest(`/profiles/chats/start/${teacherId}/`, { method: 'POST' });
            if (res?.ok) {
                const data = await res.json();
                onClose();
                navigate(`/chats/${data.chat_id}`);
            } else {
                toast.error("Не вдалося створити чат з викладачем");
            }
        } catch (error) {
            toast.error("Помилка з'єднання з сервером");
        }
    };

    useEffect(() => {
        if (isOpen) {
            setViewDate(new Date());
            setSelectedDate(new Date());
        }
    }, [isOpen]);

    return (
        <>
            <div className={`${styles.overlay} ${isOpen ? styles.active : ''}`} onClick={onClose} />

            <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
                <div className={styles.dragHandle}></div>
                
                <div className={styles.header}>
                    <div className={styles.monthYear}>
                        <div className={styles.arrow} style={{ transform: 'rotate(90deg)' }} onClick={() => changeMonth(-1)}>{SVG_ARROW_DOWN}</div>
                        <span>{MONTH_FULL_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
                        <div className={styles.arrow} style={{ transform: 'rotate(-90deg)' }} onClick={() => changeMonth(1)}>{SVG_ARROW_DOWN}</div>
                    </div>
                    <div className={styles.closeBtn} onClick={onClose}>
                        <div style={{ transform: 'rotate(45deg)', display: 'flex' }}>{SVG_PLUS}</div>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.calendarGrid}>
                        {daysOfWeek.map((d, i) => (
                            <div key={d} className={`${styles.dayName} ${i === 6 || i === 0 ? styles.weekendName : ''}`}>{d}</div>
                        ))}

                        {calendarDays.map((item, idx) => {
                            const isRealToday = item.dateStr === getLocalDateString(today);
                            const isSelected = item.dateStr === getLocalDateString(selectedDate);
                            const isWeekend = idx % 7 === 0 || idx % 7 === 6;

                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleDayClick(item)}
                                    style={isRealToday && !isSelected ? { border: '1px solid var(--color-main)' } : {}}
                                    className={`${styles.dayCell} ${!item.current ? styles.notCurrent : ''} ${isSelected ? styles.today : ''} ${isWeekend ? styles.weekend : ''}`}
                                >
                                    {item.day}
                                </div>
                            );
                        })}
                    </div>

                    <div className={styles.scheduleList}>
                        {schedule.length === 0 ? (
                            <div className={styles.emptyMsg}>На цей день пар немає</div>
                        ) : (
                            schedule.map(item => {
                                const startMin = timeToMinutes(item.start);
                                const endMin = timeToMinutes(item.end);
                                const isCurrentLesson = item.date === getLocalDateString(today) && nowMinutes >= startMin && nowMinutes < endMin;

                                return (
                                    <div key={item.id} className={`${styles.scheduleCard} ${isCurrentLesson ? styles.currentCard : ''}`}>
                                        <div className={styles.cardInfo}>
                                            <div className={styles.subjectTitle}>{item.title}</div>
                                            <div className={styles.lessonType}>{item.type}</div>
                                            <div className={styles.timeAndRoom}>
                                                {item.start} - {item.end} | {formatClassroom(item.classroom)} 
                                                {isStudent() && item.teacher_id && (
                                                    <div className={styles.chatsBtn} onClick={() => handleStartChat(item.teacher_id!)}>
                                                        {SVG_CHATS}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}