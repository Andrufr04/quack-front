import { useEffect, useMemo, useState } from "react"
import { formatDate } from "../../../lib/formatDate"
import ActionButton from "../../ActionButton/ui/ActionButton"
import { SVG_PLUS } from "../../icons/icons"
import styles from "./TaskExtended.module.css"
import type { Task } from "../../../../entities/task/model/types"
import { taskApi } from "../../../../entities/task/api/taskApi"
import toast from "react-hot-toast"

export default function TaskExtended({ onCloseClick, task }: { onCloseClick: () => void, task: Task }) {
    const [description, setDescription] = useState("")
    const [files, setFiles] = useState<File[]>([])
    const [loading, setLoading] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const isValid = description.trim().length > 0 || files.length > 0

    const handleUpload = async () => {
        if (!isValid || loading) return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("text", description);
            formData.append("task_id", task.id);

            files.forEach((f) => {
                formData.append('attachments', f);
            });

            const result = await taskApi.submitTaskWork(formData);

            if (result) {
                onCloseClick();
                toast.success("Завдання завантажено!")
            }
        } catch (error) {
            toast.error("Помилка при завантаженні!")
            console.error("Помилка при завантаженні:", error);
        } finally {
            setLoading(false);
        }
    };

    const classifiedFiles = useMemo(() => {
        const images: { url: string, name: string }[] = [];
        const videos: { url: string, name: string }[] = [];
        const others: { url: string, name: string }[] = [];

        if (!task.attachments?.files) return { images, videos, others };

        task.attachments.files.forEach(f => {
            const url = f.file;
            let name = 'file';
            try {
                name = decodeURIComponent(url.split('/').pop() || 'file');
            } catch (e) {
                name = url.split('/').pop() || 'file';
            }
            const ext = name.split('.').pop()?.toLowerCase();

            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
                images.push({ url, name });
            } else if (['mp4', 'webm', 'ogg', 'mov'].includes(ext || '')) {
                videos.push({ url, name });
            } else {
                others.push({ url, name });
            }
        });

        return { images, videos, others };
    }, [task]);

    useEffect(() => {
        setDescription("")
        setFiles([])
    }, [task])

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
                    <div className={styles.descriptionInfo} style={{ maxHeight: (classifiedFiles.images.length > 0 || classifiedFiles.videos.length > 0 || classifiedFiles.others.length > 0) ? "7.5em" : "25em" }}>{task.description}</div>
                </div>
            </div>

            <div className={styles.attachmentsContainer}>
                {classifiedFiles.images.length > 0 && (
                    <div className={styles.mediaGrid}>
                        {classifiedFiles.images.map((img, i) => (
                            <img key={`img-${i}`} src={img.url} alt={img.name} className={styles.mediaItem} onClick={() => setPreviewImage(img.url)} />
                        ))}
                    </div>
                )}

                {classifiedFiles.videos.length > 0 && (
                    <div className={styles.mediaGrid}>
                        {classifiedFiles.videos.map((vid, i) => (
                            <video key={`vid-${i}`} src={vid.url} controls className={styles.mediaItem} preload="metadata" />
                        ))}
                    </div>
                )}

                {classifiedFiles.others.length > 0 && (
                    <div className={styles.downloadList}>
                        {classifiedFiles.others.map((file, i) => (
                            <a key={`doc-${i}`} href={file.url} target="_blank" rel="noopener noreferrer" download className={styles.downloadBtn}>
                                Завантажити: {file.name}
                            </a>
                        ))}
                    </div>
                )}
            </div>

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

        {previewImage && (
            <div className={styles.imageModalOverlay} onClick={() => setPreviewImage(null)}>
                <div className={styles.imageModalContent}>
                    <img src={previewImage} alt="Full screen" className={styles.fullScreenImage} />
                </div>
            </div>
        )}
    </>
    )
}