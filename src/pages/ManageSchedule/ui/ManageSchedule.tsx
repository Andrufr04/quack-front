import { useEffect, useState } from "react"
import styles from "./ManageSchedule.module.css" // Використовуємо ті ж стилі
import Page403 from "../../Page403/ui/Page403"
import { apiRequest } from "../../../shared/api/api"
import { isAdministration } from "../../../entities/session/lib/jwt"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"

interface SimpleEntity {
    id: string;
    name: string;
}

export default function ManageSchedule() {
    if (!isAdministration()) return <Page403 />

    const [groups, setGroups] = useState<SimpleEntity[]>([]);
    const [teachers, setTeachers] = useState<SimpleEntity[]>([]);
    const [subjects, setSubjects] = useState<SimpleEntity[]>([]);
    const [types, setTypes] = useState<SimpleEntity[]>([]);

    const [formData, setFormData] = useState({
        study_group: "",
        teacher: "",
        subject: "",
        lesson_type: "",
        start_time: "",
        end_time: "",
        classroom: "Онлайн",
        task_id: ""
    })

    useEffect(() => {
        Promise.all([
            apiRequest('/education/all-groups/').then(res => res?.json()).then(setGroups),
            apiRequest('/education/all-teachers/').then(res => res?.json()).then(setTeachers),
            apiRequest('/education/subjects/').then(res => res?.json()).then(setSubjects),
            apiRequest('/education/admin-lesson-types/').then(res => res?.json()).then(setTypes),
        ])
    }, [])

    useEffect(() => {
        if (formData.study_group) {
            apiRequest(`/education/subjects/?group_id=${formData.study_group}`)
                .then(res => res?.json())
                .then(setSubjects);
        } else {
            setSubjects([]); // Очищуємо список, якщо групу скасовано
            setFormData(prev => ({ ...prev, subject: "" })); // Скидаємо обраний предмет
        }
    }, [formData.study_group]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await apiRequest('/education/lessons/create/', {
            method: 'POST',
            body: JSON.stringify(formData)
        })
        if (res?.ok) {
            toast.success("Пару додано!")
        } else {
            toast.error("Пару не було створено!")
        }
    }

    return (<>
    <title>Quack | Керування розкладом</title>
        <div className={styles.menu}>
            <div className={styles.current}><Link to="">Створити пару</Link></div>
            <div className={styles.line}></div>
            <Link to="/managescheduledelete">Змінити</Link>
        </div>

        <div className={styles.formContainer}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h2>Додати пару в розклад</h2>

                <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={styles.label}>Група</label>
                        <select className={styles.input} onChange={e => setFormData({ ...formData, study_group: e.target.value })}>
                            <option value="">Обрати групу</option>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Викладач</label>
                        <select className={styles.input} onChange={e => setFormData({ ...formData, teacher: e.target.value })}>
                            <option value="">Обрати викладача</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={`${styles.label} ${formData.subject ? styles.successText : ""}`}>
                            Предмет {!formData.study_group && <span className={styles.required}>(спочатку оберіть групу)</span>}
                        </label>
                        <select
                            className={`${styles.input} ${formData.subject ? styles.success : ""}`}
                            disabled={!formData.study_group} // Блокуємо, якщо група не обрана
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        >
                            <option value="">Обрати предмет</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={styles.label}>Тип заняття</label>
                        <select className={styles.input} value={formData.lesson_type} onChange={e => setFormData({ ...formData, lesson_type: e.target.value })}>
                            <option value="">Обрати тип заняття</option>
                            {types.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Аудиторія</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Напр: 402 або Онлайн"
                            value={formData.classroom}
                            onChange={e => setFormData({ ...formData, classroom: e.target.value })}
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={styles.label}>Початок</label>
                        <input
                            type="datetime-local"
                            className={styles.input}
                            onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Кінець</label>
                        <input
                            type="datetime-local"
                            className={styles.input}
                            onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                        />
                    </div>
                </div>

                <button className={styles.submit} type="submit">Створити заняття</button>
            </form>
        </div>
    </>
    )
}