import React, { useMemo } from 'react';
import styles from './CalendarSidebar.module.css';
import { SVG_PLUS } from '../../icons/icons';

interface CalendarSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

// Масив з розкладом
const SCHEDULE = [
    { id: 1, title: "Вища математика", start: "08:30", end: "10:00", room: "402" },
    { id: 2, title: "Програмування React", start: "10:15", end: "11:45", room: "Лаб 3" },
    { id: 3, title: "Іноземна мова", start: "12:15", end: "13:45", room: "215" },
    { id: 4, title: "Фізичне виховання", start: "14:00", end: "15:30", room: "Спортзал" },
];

export default function CalendarSidebar({ isOpen, onClose }: CalendarSidebarProps) {
    const today = new Date();
    const currentDay = today.getDate();
    
    // Назви днів тижня
    const daysOfWeek = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    // Генерація днів для календаря (спрощено для березня 2026 як на фото)
    const calendarDays = useMemo(() => {
        // На фото ми бачимо хвіст лютого (29, 30, 31) і початок квітня
        // Для адекватної роботи тут зазвичай використовується бібліотека date-fns, 
        // але зробимо масив для візуальної відповідності:
        const prevMonth = [22, 23, 24, 25, 26, 27, 28]; // приклад
        const currentMonth = Array.from({ length: 31 }, (_, i) => i + 1);
        const nextMonth = [1, 2, 3, 4, 5, 6, 7, 8];
        
        // Повертаємо дні з позначкою, чи це поточний місяць
        return [
            ...[22, 23, 24, 25, 26, 27, 28].map(d => ({ day: d, current: false })), // Лютий
            ...Array.from({ length: 31 }, (_, i) => ({ day: i + 1, current: true })), // Березень
            ...[1, 2, 3, 4, 5, 6, 7, 8].map(d => ({ day: d, current: false })) // Квітень
        ].slice(0, 42); // Рівно 6 рядків
    }, []);

    return (
        <>
            <div className={`${styles.overlay} ${isOpen ? styles.active : ''}`} onClick={onClose} />
            
            <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.header}>
                    <div className={styles.monthYear}>
                        Березень 2026
                    </div>
                    <div className={styles.closeBtn} onClick={onClose}>
                        <div style={{ transform: 'rotate(45deg)', display: 'flex' }}>{SVG_PLUS}</div>
                    </div>
                </div>
                
                <div className={styles.content}>
                    {/* Сітка календаря */}
                    <div className={styles.calendarGrid}>
                        {daysOfWeek.map((d, i) => (
                            <div key={d} className={`${styles.dayName} ${i >= 5 ? styles.weekendName : ''}`}>
                                {d}
                            </div>
                        ))}
                        
                        {calendarDays.map((item, idx) => {
                            const isToday = item.current && item.day === currentDay;
                            const isWeekend = idx % 7 === 5 || idx % 7 === 6;
                            
                            return (
                                <div 
                                    key={idx} 
                                    className={`
                                        ${styles.dayCell} 
                                        ${!item.current ? styles.notCurrent : ''} 
                                        ${isToday ? styles.today : ''}
                                        ${isWeekend ? styles.weekend : ''}
                                    `}
                                >
                                    {item.day}
                                </div>
                            );
                        })}
                    </div>

                    {/* Розклад */}
                    <div className={styles.scheduleList}>
                        {SCHEDULE.map(item => (
                            <div key={item.id} className={styles.scheduleCard}>
                                <div className={styles.cardInfo}>
                                    <div className={styles.subjectTitle}>{item.title}</div>
                                    <div className={styles.timeAndRoom}>
                                        {item.start} — {item.end} | Ауд. {item.room}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}