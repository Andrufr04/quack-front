import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import styles from "./ManageTasks.module.css"
import { taskApi } from "../../../entities/task/api/taskApi"
import { isTeacher } from "../../../entities/session/lib/jwt"
import Page403 from "../../Page403/ui/Page403"

export default function ManageTasks() {
    if (!isTeacher()) return <Page403 />
    const [groupsList, setGroupsList] = useState<{ id: string, name: string }[]>([])
    const [subjectsList, setSubjectsList] = useState<{ id: string, name: string }[]>([])
    const [typesList, setTypesList] = useState<{ id: string, name: string }[]>([])

    const [group, setGroup] = useState<string>("")
    const [subject, setSubject] = useState<string>("")
    const [type, setType] = useState<string>("")
    const [deadline, setDeadline] = useState<string>("")
    const [theme, setTheme] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [files, setFiles] = useState<File[]>([])

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, boolean>>({})
    const [descFileError, setDescFileError] = useState<boolean>(false)

    // 1. Завантаження груп при старті сторінки
    useEffect(() => {
        taskApi.getTeacherGroups().then(setGroupsList)
    }, [])

    // 2. Завантаження предметів, коли обрана група
    useEffect(() => {
        if (group) {
            taskApi.getTeacherSubjectsByGroup(group).then(setSubjectsList)
            taskApi.getTaskTypes().then(setTypesList);
        } else {
            setSubjectsList([])
        }
    }, [group])

    const validate = () => {
        const newErrors: Record<string, boolean> = {}
        if (!group) newErrors.group = true
        if (!subject) newErrors.subject = true
        if (!deadline) newErrors.deadline = true
        if (!theme) newErrors.theme = true

        const isDescOrFileValid = description.trim() !== "" || files.length > 0;
        setDescFileError(!isDescOrFileValid)
        setErrors(newErrors)

        return Object.keys(newErrors).length === 0 && isDescOrFileValid
    }

    // 3. Відправка форми
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!validate() || loading) return

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('study_group', group)
            formData.append('subject', subject)
            if (type) formData.append('task_type', type)
            formData.append('deadline', deadline)
            formData.append('theme', theme)
            formData.append('description', description)

            // Додаємо всі файли з масиву
            files.forEach((f) => {
                formData.append('attachments', f); // Ключ має збігатися з тим, що чекає Django
            });

            const res = await taskApi.createTask(formData)
            if (res) {
                // Очищення стейту
                setGroup("")
                setSubject("")
                setDeadline("")
                setTheme("")
                setDescription("")
                setFiles([]) // Очищуємо масив файлів
            }
        } catch (err) {
            console.error("Помилка створення:", err)
        } finally {
            setLoading(false)
        }
    }

    const isFormValid = group && subject && deadline && theme && (description || files.length > 0) && !loading

    return <>
        <title>Quack | Завдання</title>

        <div className={styles.menu}>
            <div className={styles.current}><Link to="">Створити завдання</Link></div>
            <div className={styles.line}></div>
            <Link to="/managechecktasks">Перевірити</Link>
        </div>

        <div className={styles.formContainer}>
            <form className={styles.form} onSubmit={handleSubmit}>

                <div className={styles.row}>

                    <div className={styles.field}>
                        <div className={`${styles.label} ${group ? styles.successText : ""}`}>
                            Обрати групу <span className={group ? styles.successText : styles.required}>*обов'язково</span>
                        </div>

                        <select
                            className={`${styles.input} ${errors.group ? styles.error : ""} ${group ? styles.success : ""}`}
                            value={group}
                            onChange={(e) => {
                                setGroup(e.target.value)
                                setSubject("")
                            }}
                        >
                            <option value="">Обрати групу</option>
                            {groupsList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <div className={`${styles.label} ${subject ? styles.successText : ""}`}>
                            Предмет <span className={subject ? styles.successText : styles.required}>*обов'язково</span>
                        </div>

                        <select
                            disabled={!group}
                            className={`${styles.input} ${errors.subject ? styles.error : ""} ${subject ? styles.success : ""}`}
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        >
                            <option value="">Предмет</option>
                            {subjectsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                </div>

                <div className={styles.row}>

                    <div className={styles.field}>
                        <div className={styles.label}>
                            Тип завдання <span className={styles.optional}>*не обов'язково</span>
                        </div>

                        <select
                            className={`${styles.input} ${type ? styles.success : ""}`}
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="">Тип завдання</option>
                            {typesList.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <div className={`${styles.label} ${deadline ? styles.successText : ""}`}>
                            Дедлайн <span className={deadline ? styles.successText : styles.required}>*обов'язково</span>
                        </div>

                        <input
                            type="date"
                            className={`${styles.input} ${errors.deadline ? styles.error : ""} ${deadline ? styles.success : ""}`}
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                        />
                    </div>

                </div>

                <div className={styles.field}>
                    <div className={`${styles.label} ${theme ? styles.successText : ""}`}>
                        Тема <span className={theme ? styles.successText : styles.required}>*обов'язково</span>
                    </div>

                    <input
                        type="text"
                        placeholder="Тема"
                        className={`${styles.input} ${errors.theme ? styles.error : ""} ${theme ? styles.success : ""}`}
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                    />
                </div>

                <div className={styles.field}>
                    <div className={`${styles.label} ${(description || files.length > 0) ? styles.successText : ""}`}>
                        <span className={(description || files.length > 0) ? styles.successText : styles.required}>
                            *оберіть опис, файл або обидва
                        </span>
                    </div>
                    <textarea
                        placeholder="Опис"
                        className={`${styles.textarea} ${descFileError ? styles.error : ""} ${description ? styles.success : ""}`}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <input
                    type="file"
                    multiple
                    className={`${styles.file} ${files.length > 0 ? styles.success : ""} ${descFileError ? styles.error : ""}`}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        if (e.target.files) {
                            setFiles(Array.from(e.target.files));
                        }
                    }}
                />

                {descFileError && (
                    <div className={styles.hint}>
                        Потрібно написати опис або завантажити файл
                    </div>
                )}

                <div className={styles.submitWrap}>
                    <button
                        className={styles.submit}
                        disabled={!isFormValid}
                    >
                        {loading ? "Завантаження..." : "Завантажити"}
                    </button>
                </div>

            </form>
        </div>
    </>
}