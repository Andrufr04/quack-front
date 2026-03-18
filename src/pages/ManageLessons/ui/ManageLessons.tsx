import { useState } from "react";
import styles from "./ManageLessons.module.css";
import ActionButton from "../../../shared/ui/ActionButton/ui/ActionButton";
import { SVG_DUCK } from "../../../shared/ui/icons/icons";

type Student = {
    id: number;
    name: string;
    attendance: "green" | "yellow" | "red" | null;
    grade: number | null;
    iconActive: boolean;
};

const initialStudents: Student[] = [
    { id: 1, name: "Аліса Чувирло", attendance: null, grade: null, iconActive: false },
    { id: 2, name: "Богдан Богомдан", attendance: null, grade: null, iconActive: false },
    { id: 3, name: "Віка Зтопмодель", attendance: null, grade: null, iconActive: false },
    { id: 4, name: "Віка Зтопмодель", attendance: null, grade: null, iconActive: false },
    { id: 5, name: "Віка Зтопмодель", attendance: null, grade: null, iconActive: false },
    { id: 6, name: "Віка Зтопмодель", attendance: null, grade: null, iconActive: false },
    { id: 7, name: "Віка Зтопмодель", attendance: null, grade: null, iconActive: false },
    { id: 8, name: "Віка Зтопмодель", attendance: null, grade: null, iconActive: false },
    { id: 9, name: "Віка Зтопмодель", attendance: null, grade: null, iconActive: false },
    { id: 10, name: "Віка Зтопмодель", attendance: null, grade: null, iconActive: false },
    { id: 11, name: "Віка Зтопмодель", attendance: null, grade: null, iconActive: false },

];

export default function ManageLesson() {
    const [students, setStudents] = useState(initialStudents);
    const [topic, setTopic] = useState("");
    const [currentTab, setCurrentTab] = useState(0); // 0 = перша пара

    const maxChars = 200;

    const handleAttendance = (id: number, type: "green" | "yellow" | "red") => {
        setStudents((prev) =>
            prev.map((s) =>
                s.id === id ? { ...s, attendance: s.attendance === type ? null : type } : s
            )
        );
    };

    const handleGrade = (id: number, grade: number) => {
        setStudents((prev) =>
            prev.map((s) => (s.id === id ? { ...s, grade } : s))
        );
    };

    const toggleIcon = (id: number) => {
        setStudents((prev) =>
            prev.map((s) => (s.id === id ? { ...s, iconActive: !s.iconActive } : s))
        );
    };

    return (
        <div className={styles.container}>
            {/* Вкладка */}
            <div className={styles.tabs}>
                {["12:00-13:20 - КН-П-67", "13:30-14:50 - КН-П-44", "13:30-14:50 - КН-П-44", "13:30-14:50 - КН-П-44", "13:30-14:50 - КН-П-44", "13:30-14:50 - КН-П-44", "13:30-14:50 - КН-П-44", "13:30-14:50 - КН-П-44", "13:30-14:50 - КН-П-44", "13:30-14:50 - КН-П-44", "13:30-14:50 - КН-П-44", "13:30-14:50 - КН-П-44", "13:30-14:50 - КН-П-44"].map((tab, idx) => (
                    <div
                        key={idx}
                        className={`${styles.tab} ${currentTab === idx ? styles.tabActive : ""}`}
                        onClick={() => setCurrentTab(idx)}
                    >
                        {tab}
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
                        maxLength={maxChars} // необов'язково, але можна обмежити
                    />
                    <span className={`${styles.charCounter} ${topic.length > maxChars ? styles.exceed : ""}`}>
                        {topic.length}/{maxChars}
                    </span>
                </div>

                <button className={styles.topicButton}>Завантажити завдання</button>
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
                            {students.map((student, idx) => (
                                <tr key={student.id}>
                                    <td>{idx + 1}</td>
                                    <td>{student.name}</td>
                                    <td>
                                        <div className={styles.attendanceRow}>
                                            <div
                                                className={`${styles.attBox} ${styles.green} ${student.attendance === "green" ? styles.active : ""
                                                    }`}
                                                onClick={() => handleAttendance(student.id, "green")}
                                            ></div>
                                            <div
                                                className={`${styles.attBox} ${styles.yellow} ${student.attendance === "yellow" ? styles.active : ""
                                                    }`}
                                                onClick={() => handleAttendance(student.id, "yellow")}
                                            ></div>
                                            <div
                                                className={`${styles.attBox} ${styles.red} ${student.attendance === "red" ? styles.active : ""
                                                    }`}
                                                onClick={() => handleAttendance(student.id, "red")}
                                            ></div>
                                        </div>
                                    </td>
                                    <td>
                                        <select className={styles.mark}
                                            value={student.grade ?? ""}
                                            onChange={(e) => handleGrade(student.id, Number(e.target.value))}
                                        >
                                            <option value="" disabled>-</option>
                                            {[...Array(12)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td
                                        className={student.iconActive ? styles.iconActive : styles.icon}
                                        onClick={() => toggleIcon(student.id)}
                                    >
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
