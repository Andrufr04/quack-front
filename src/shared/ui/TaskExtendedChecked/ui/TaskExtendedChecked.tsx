import { useMemo, useState } from "react";
import type { TaskStatus } from "../../../../entities/task/model/types"
import { SVG_PLUS } from "../../icons/icons"
import styles from "./TaskExtendedChecked.module.css"

export default function TaskExtendedChecked({ onCloseClick, task }: { onCloseClick: () => void, task: TaskStatus }) {

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // 🔥 1. Файли викладача 🔥
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

    // 🔥 2. Твої файли (відповідь) 🔥
    const myClassifiedFiles = useMemo(() => {
        const images: { url: string, name: string }[] = [];
        const videos: { url: string, name: string }[] = [];
        const others: { url: string, name: string }[] = [];

        if (!task.submitted_attachments?.files) return { images, videos, others };

        task.submitted_attachments.files.forEach(f => {
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

    return (
        <>
            <div className={styles.TaskExtended}>
                <div className={styles.extendedTop}>
                    <div className={styles.icon} onClick={onCloseClick}>{SVG_PLUS}</div>

                    <div className={styles.description}>
                        <div className={styles.descriptionTitle}>Оцінка:</div>
                        <pre className={styles.info}>{task.mark}</pre>
                    </div>

                    <div style={{marginBottom: "1em"}}>
                        <div className={styles.topicTitle}>Коментар від викладача:</div>
                        <div className={styles.commentInfo}>{task.comment}</div>
                    </div>

                    <div className={styles.top} style={{ padding: '2em 0', borderTop: '1px solid var(--color-gray)' }}>
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
                        <div className={styles.subject} style={{ fontSize: '1.2em', marginBottom: '0.5em' }}>Ваша відповідь:</div>
                    </div>

                    <div className={styles.description} style={{ marginBottom: '1em' }}>
                        {task.submitted_text && <div className={styles.descriptionInfo} style={{ maxHeight: "25em" }}>
                            {task.submitted_text}
                        </div>}
                    </div>

                    <div className={styles.attachmentsContainer}>
                        {myClassifiedFiles.images.length > 0 && (
                            <div className={styles.mediaGrid}>
                                {myClassifiedFiles.images.map((img, i) => (
                                    <img key={`my-img-${i}`} src={img.url} alt={img.name} className={styles.mediaItem} onClick={() => setPreviewImage(img.url)} />
                                ))}
                            </div>
                        )}
                        {myClassifiedFiles.videos.length > 0 && (
                            <div className={styles.mediaGrid}>
                                {myClassifiedFiles.videos.map((vid, i) => (
                                    <video key={`my-vid-${i}`} src={vid.url} controls className={styles.mediaItem} preload="metadata" />
                                ))}
                            </div>
                        )}
                        {myClassifiedFiles.others.length > 0 && (
                            <div className={styles.downloadList}>
                                {myClassifiedFiles.others.map((file, i) => (
                                    <a key={`my-doc-${i}`} href={file.url} target="_blank" rel="noopener noreferrer" download className={styles.downloadBtn}>
                                        Завантажити: {file.name}
                                    </a>
                                ))}
                            </div>
                        )}
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