import { useState } from "react"
import type { Task } from "../../../../pages/TasksPage/ui/TaskPage"
import { formatDate } from "../../../lib/formatDate"
import ActionButton from "../../ActionButton/ui/ActionButton"
import { SVG_PLUS } from "../../icons/icons"
import styles from "./TaskExtended.module.css"

export default function TaskExtended({ onCloseClick, task }: { onCloseClick: () => void, task: Task }) {

    const [description, setDescription] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    const isValid = description.trim().length > 0 || file !== null

    const handleUpload = async () => {
        if (!isValid || loading) return

        setLoading(true)

        // имитация загрузки
        setTimeout(() => {
            console.log("description:", description)
            console.log("file:", file)
            setLoading(false)
        }, 2000)
    }

    return (
        <div className={styles.TaskExtended}>
            <div className={styles.icon} onClick={onCloseClick}>{SVG_PLUS}</div>

            <div>{`${formatDate(task.start)}-${formatDate(task.end)}`}</div>

            <div className={styles.top}>
                <div className={styles.subject}>{task.subject_name}</div>
            </div>

            <div className={styles.topic}>
                <div className={styles.topicTitle}>Тема:</div>
                <div className={styles.info}>{task.theme}</div>
            </div>

            <div className={styles.description}>
                <div className={styles.descriptionTitle}>Опис:</div>
                <div className={styles.info}>{task.description}</div>
            </div>

            <div className={styles.field}>

                <div className={`${styles.label} ${isValid ? styles.successText : styles.required}`}>
                    *оберіть опис, файл або обидва
                </div>

                <textarea
                    placeholder="Опис"
                    className={`${styles.textarea} ${description ? styles.success : ""}`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <label className={`${styles.fileWrapper} ${file ? styles.success : ""}`}>
                    <input
                        type="file" multiple
                        className={styles.fileInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFile(e.target.files ? e.target.files[0] : null)
                        }
                    />

                    <span className={styles.fileButton}>Вибрати файл</span>
                    <span className={styles.fileName}>
                        {file ? file.name : "Файл не вибрано"}
                    </span>
                </label>

            </div>

            <ActionButton
                actionButton={{
                    text: loading ? (
                        <div className={styles.loading}>
                            <img
                                className={styles.img}
                                src="/gifs/loading.svg"
                                alt="loading"
                                style={{ width: 60, height: 60, marginTop: 5 }}
                            />
                        </div>
                    ) : (
                        "Завантажити завдання"
                    ),
                    enabled: isValid && !loading,
                    onClick: handleUpload,
                    bgcolor: (!isValid || loading) ? "#ababab" : ""
                }}
            />
        </div>
    )
}

