import { useState } from "react";
import { FileViewer } from "../../FileViewer/ui/FileViewer";
import { SVG_PLUS } from "../../icons/icons"
import styles from "./TaskExtendedOnCheck.module.css"
import ActionButton from "../../ActionButton/ui/ActionButton";
import type { TeacherTaskToCheck } from "../../../../entities/task/model/types";
import { taskApi } from "../../../../entities/task/api/taskApi";

export default function TaskExtendedOnCheck({ onCloseClick, task }: { onCloseClick: () => void, task: TeacherTaskToCheck }) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [comment, setComment] = useState("")
    const [loading, setLoading] = useState(false)
    const [mark, setMark] = useState<number | "">("")

    const isValid = mark !== "" && mark >= 1 && mark <= 12;

    const docs = task.attachments?.files.map(f => ({
        uri: f.file,
        fileName: f.file.split('/').pop()
    })) || [];

    const handleUpload = async () => {
        if (!isValid || loading) return;

        setLoading(true);
        try {
            // Викликаємо твій API метод
            const result = await taskApi.gradeTaskWork(task.id, {
                mark: Number(mark),
                comment: comment
            });

            if (result) {
                onCloseClick(); // Закриваємо модалку, щоб список оновився
                window.location.reload()
            }
        } catch (error) {
            console.error("Помилка оцінювання:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={styles.TaskExtended}>
                <div className={styles.icon} onClick={onCloseClick}>{SVG_PLUS}</div>

                <div className={styles.topic}>
                    <div className={styles.topicTitle}>Тема:</div>
                    <div className={styles.info}>{task.task.theme}</div>
                </div>

                <div className={styles.description}>
                    <div className={styles.descriptionTitle}>Опис:</div>
                    <pre className={styles.descriptionInfo}>{task.task.description}</pre>
                </div>
                <br />
                <div className={styles.topic}>
                    <div className={styles.topicTitle}>Відповідь студента:</div>
                    <div className={styles.info}>{task.text}</div>
                </div>
                {docs.length > 0 && (
                    <div className={styles.viewerWrapper}>
                        <div className={styles.zoomArea} onClick={() => setIsZoomed(true)}>
                            <FileViewer docs={docs} />
                        </div>
                    </div>
                )}

                <div className={styles.description}>
                    <div className={styles.descriptionTitle}>Оцінка (1-12):</div>
                    <input 
                        type="number"
                        className={styles.markInput}
                        value={mark}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setMark("");
                            else {
                                const num = parseInt(val);
                                if (num >= 1 && num <= 12) setMark(num);
                            }
                        }}
                        placeholder="0"
                    />
                </div>

                <textarea
                    placeholder="Додати коментар для студента..."
                    className={`${styles.textarea} ${comment ? styles.success : ""}`}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />

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
                            "Оцінити"
                        ),
                        enabled: isValid && !loading,
                        onClick: handleUpload,
                        bgcolor: (!isValid || loading) ? "#ababab" : ""
                    }}
                />
            </div>
            {isZoomed && (
                <div className={styles.overlay} onClick={() => setIsZoomed(false)}>
                    <div className={styles.fullViewer} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.iconModal} onClick={onCloseClick}>{SVG_PLUS}</div>
                        <FileViewer
                            docs={docs}
                            style={{ width: '90%', height: '90%' }}
                        />
                    </div>
                </div>
            )}
        </>
    )
}