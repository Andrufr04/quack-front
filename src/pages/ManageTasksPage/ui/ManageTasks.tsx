import { Link } from "react-router-dom"
import { useState } from "react"
import styles from "./ManageTasks.module.css"

export default function ManageTasks() {

    const [group, setGroup] = useState<string>("")
    const [subject, setSubject] = useState<string>("")
    const [type, setType] = useState<string>("")
    const [deadline, setDeadline] = useState<string>("")
    const [theme, setTheme] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [file, setFile] = useState<File | null>(null)

    const [errors, setErrors] = useState<Record<string, boolean>>({})
    const [descFileError, setDescFileError] = useState<boolean>(false)

    const validate = () => {

        const newErrors: Record<string, boolean> = {}

        if (!group) newErrors.group = true
        if (!subject) newErrors.subject = true
        if (!deadline) newErrors.deadline = true
        if (!theme) newErrors.theme = true

        if (!description && !file) {
            setDescFileError(true)
        } else {
            setDescFileError(false)
        }

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0 && (description || file)
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!validate()) return
        console.log("форма отправлена")
    }

    const isFormValid =
        group &&
        subject &&
        deadline &&
        theme &&
        (description || file)

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
                            <option>Група 1</option>
                            <option>Група 2</option>
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
                            <option>Математика</option>
                            <option>Інформатика</option>
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
                            <option>Домашня</option>
                            <option>Контрольна</option>
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

                    <div className={`${styles.label} ${(description || file) ? styles.successText : ""}`}>
                        <span className={(description || file) ? styles.successText : styles.required}>
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
                    className={`${styles.file} ${file ? styles.success : ""} ${descFileError ? styles.error : ""}`}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFile(e.target.files ? e.target.files[0] : null)
                    }
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
                        Загрузити
                    </button>
                </div>

            </form>
        </div>
    </>
}