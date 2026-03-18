import { useMemo, useState } from "react"
import { formatDate } from "../../../lib/formatDate"
import ActionButton from "../../ActionButton/ui/ActionButton"
import { SVG_PLUS } from "../../icons/icons"
import styles from "./TaskExtended.module.css"
import type { Task } from "../../../../entities/task/model/types"
import { FileViewer } from "../../FileViewer/ui/FileViewer"
import { taskApi } from "../../../../entities/task/api/taskApi"

export default function TaskExtended({ onCloseClick, task }: { onCloseClick: () => void, task: Task }) {
    const [description, setDescription] = useState("")
    const [files, setFiles] = useState<File[]>([])
    const [loading, setLoading] = useState(false)

    const isValid = description.trim().length > 0 || files.length > 0

    const handleUpload = async () => {
        if (!isValid || loading) return;

        setLoading(true);

        try {
            const formData = new FormData();

            formData.append("text", description);

            formData.append("task_id", task.id);

            files.forEach((f) => {
                formData.append('attachments', f); // Ключ має збігатися з тим, що чекає Django
            });

            // 4. Виклик твого API
            const result = await taskApi.submitTaskWork(formData);

            if (result) {
                onCloseClick(); // Закриваємо модалку після успіху
                // Тут можна ще додати refresh списку завдань через контекст або props
            }
        } catch (error) {
            console.error("Помилка при завантаженні:", error);
        } finally {
            setLoading(false);
        }
    };

    const docs = useMemo(() => {
        return task.attachments?.files.map(f => ({
            uri: f.file,
            fileName: f.file.split('/').pop()
        })) || [];
    }, [task]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(Array.from(e.dataTransfer.files));
            e.dataTransfer.clearData();
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (<>
        <div className={styles.TaskExtended}>
            <div className={styles.extendedTop}>
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
                    <pre className={styles.descriptionInfo}>{task.description}</pre>
                </div>
            </div>

            {docs.length > 0 && <FileViewer docs={docs} />}

            <div className={styles.extendedBottom}>
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

                    <label className={`${styles.fileWrapper} ${files.length > 0 ? styles.success : ""}`} onDragOver={handleDragOver} onDrop={handleDrop}>
                        <input
                            type="file"
                            multiple
                            className={styles.fileInput}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                if (e.target.files) {
                                    setFiles(Array.from(e.target.files));
                                }
                            }}
                        />

                        <span className={styles.fileButton}>Вибрати файл</span>
                        <span className={styles.fileName}>
                            {files.length === 1 ? files[0].name :
                                files.length > 1 ? `${files[0].name} + ${files.length - 1} файл(и)` :
                                    "Файл не вибрано"}
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
        </div>
    </>
    )
}

