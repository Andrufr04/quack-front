import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./ManageCheckTasks.module.css"

export default function ManageCheckTasks() {
    const [selected, setSelected] = useState("Всі");
    const selectRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        if (selectRef.current) {
            const tempSpan = document.createElement("span");
            tempSpan.style.visibility = "hidden";
            tempSpan.style.position = "absolute";
            tempSpan.style.font = window.getComputedStyle(selectRef.current).font;
            tempSpan.textContent = selected;
            document.body.appendChild(tempSpan);

            const arrowWidth = 25;
            selectRef.current.style.width = tempSpan.offsetWidth + arrowWidth + "px";

            document.body.removeChild(tempSpan);
        }
    }, [selected]);

    return (
        <div className={styles.menuPlus}>
            <div className={styles.menu}>
                <Link to="/managetasks">Створити завдання</Link>
                <div className={styles.line}></div>
                <div className={styles.current}><Link to="">Перевірити</Link></div>
            </div>

            <select
                ref={selectRef}
                className={styles.groupSelect}
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
            >
                <option>Всі</option>
                <option>Група 1</option>
                <option>Група 2</option>
            </select>
        </div>
    );
}