import { useMemo, useState } from "react";
import { SVG_PLUS } from "../../icons/icons"
import styles from "./TaskExtendedOnCheck.module.css"
import ActionButton from "../../ActionButton/ui/ActionButton";
import type { TeacherTaskToCheck } from "../../../../entities/task/model/types";
import { taskApi } from "../../../../entities/task/api/taskApi";
import toast from "react-hot-toast";

export default function TaskExtendedOnCheck({ onCloseClick, onSuccess, task }: { onCloseClick: () => void, onSuccess: () => void, task: TeacherTaskToCheck }) {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [mark, setMark] = useState<number | "">("");

    const isValid = mark !== "" && mark >= 1 && mark <= 12;

    // 🔥 1. Файли викладача (завдання)
    const classifiedFiles = useMemo(() => {
        const images: { url: string, name: string }[] = [];
        const videos: { url: string, name: string }[] = [];
        const others: { url: string, name: string }[] = [];

        if (!task.task.attachments?.files) return { images, videos, others };

        task.task.attachments.files.forEach(f => {
            const url = f.file;
            let name = 'file';
            try { name = decodeURIComponent(url.split('/').pop() || 'file'); }
            catch (e) { name = url.split('/').pop() || 'file'; }

            const ext = name.split('.').pop()?.toLowerCase();

            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) images.push({ url, name });
            else if (['mp4', 'webm', 'ogg', 'mov'].includes(ext || '')) videos.push({ url, name });
            else others.push({ url, name });
        });

        return { images, videos, others };
    }, [task]);

    // 🔥 2. Файли студента (відповідь)
    const studentClassifiedFiles = useMemo(() => {
        const images: { url: string, name: string }[] = [];
        const videos: { url: string, name: string }[] = [];
        const others: { url: string, name: string }[] = [];

        if (!task.attachments?.files) return { images, videos, others };

        task.attachments.files.forEach(f => {
            const url = f.file;
            let name = 'file';
            try { name = decodeURIComponent(url.split('/').pop() || 'file'); }
            catch (e) { name = url.split('/').pop() || 'file'; }

            const ext = name.split('.').pop()?.toLowerCase();

            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) images.push({ url, name });
            else if (['mp4', 'webm', 'ogg', 'mov'].includes(ext || '')) videos.push({ url, name });
            else others.push({ url, name });
        });

        return { images, videos, others };
    }, [task]);

    const handleUpload = async () => {
        if (!isValid || loading) return;

        setLoading(true);
        try {
            const result = await taskApi.gradeTaskWork(task.id, {
                mark: Number(mark),
                comment: comment
            });

            if (result) {
                toast.success("Завдання оцінено!");
                onSuccess();
            }
        } catch (error) {
            toast.error("Помилка оцінювання!");
            console.error("Помилка оцінювання:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={styles.TaskExtended}>

                <div className={styles.extendedTopWrap}>
                    <div className={styles.extendedTop}>
                        <div className={styles.icon} onClick={onCloseClick}>{SVG_PLUS}</div>

                        <div className={styles.top}>
                            <div className={styles.subject}>{task.task.subject_name}</div>
                        </div>

                        <div className={styles.topic}>
                            <div className={styles.topicTitle}>Тема:</div>
                            <div className={styles.info}>{task.task.theme}</div>
                        </div>

                        <div className={styles.description}>
                            <div className={styles.descriptionTitle}>Опис:</div>
                            <div className={styles.descriptionInfo} style={{ maxHeight: (classifiedFiles.images.length > 0 || classifiedFiles.videos.length > 0 || classifiedFiles.others.length > 0) ? "7.5em" : "25em" }}>{task.task.description}</div>
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
                    </div>

                    <div style={{ padding: '2em 0', borderTop: '1px solid var(--color-gray)' }}>
                        <div className={styles.top}>
                            <div className={styles.subject} style={{ fontSize: '1.2em', marginBottom: '0.5em' }}>Відповідь студента:</div>
                        </div>

                        <div className={styles.description} style={{ marginBottom: '1em' }}>
                            {task.text && <div className={styles.descriptionInfo} style={{ maxHeight: "25em" }}>
                                {task.text}
                            </div>}
                        </div>

                        <div className={styles.attachmentsContainer}>
                            {studentClassifiedFiles.images.length > 0 && (
                                <div className={styles.mediaGrid}>
                                    {studentClassifiedFiles.images.map((img, i) => (
                                        <img key={`stu-img-${i}`} src={img.url} alt={img.name} className={styles.mediaItem} onClick={() => setPreviewImage(img.url)} />
                                    ))}
                                </div>
                            )}
                            {studentClassifiedFiles.videos.length > 0 && (
                                <div className={styles.mediaGrid}>
                                    {studentClassifiedFiles.videos.map((vid, i) => (
                                        <video key={`stu-vid-${i}`} src={vid.url} controls className={styles.mediaItem} preload="metadata" />
                                    ))}
                                </div>
                            )}
                            {studentClassifiedFiles.others.length > 0 && (
                                <div className={styles.downloadList}>
                                    {studentClassifiedFiles.others.map((file, i) => (
                                        <a key={`stu-doc-${i}`} href={file.url} target="_blank" rel="noopener noreferrer" download className={styles.downloadBtn}>
                                            Завантажити: {file.name}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ padding: '2em 0', borderTop: '1px solid var(--color-gray)' }}>
                    <div className={styles.field}>
                        <div className={styles.descriptionTitle}>Оцінка (1-12):</div>
                        <input
                            type="number"
                            className={`${styles.markInput} ${mark !== "" ? styles.success : ""}`}
                            value={mark}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === "") setMark("");
                                else {
                                    const num = parseInt(val);
                                    if (num >= 1 && num <= 12) setMark(num);
                                }
                            }}
                            placeholder="Наприклад: 10"
                            min="1"
                            max="12"
                        />
                    </div>

                    <div className={styles.field} style={{ marginTop: '1em' }}>
                        <div className={styles.descriptionTitle}>Коментар:</div>
                        <textarea
                            placeholder="Додати коментар для студента..."
                            className={`${styles.textarea} ${comment ? styles.success : ""}`}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    <div style={{ marginTop: '1em' }}>
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