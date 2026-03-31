import React, { useState, useRef, useEffect } from 'react';
import styles from './ManageNewsPage.module.css'; // Використовуємо існуючі стилі
import { apiRequest } from '../../../shared/api/api';
import { isAdministration } from '../../../entities/session/lib/jwt';
import Page403 from '../../Page403/ui/Page403';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface NewsItem {
    id: string;
    title: string;
    text: string;
    image?: string;
    created_at: string;
}

export default function ManageNewsPage() {
    if (!isAdministration()) return <Page403 />;

    const [newsList, setNewsList] = useState<NewsItem[]>([]);
    
    // Стейт форми
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Стейт для редагування
    const [editingId, setEditingId] = useState<string | null>(null);

    const loadNews = async () => {
        const res = await apiRequest('/education/news/admin/');
        if (res?.ok) {
            const data = await res.json();
            setNewsList(data);
        }
    };

    useEffect(() => {
        loadNews();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim() || !text.trim()) {
            toast.error("Заповніть заголовок та текст.");
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('text', text);
        if (image) formData.append('image', image);

        if (editingId) {
            // 🔥 РЕДАГУВАННЯ 🔥
            const res = await apiRequest(`/education/news/admin/${editingId}/`, {
                method: 'PATCH',
                body: formData
            });

            if (res?.ok) {
                toast.success("Новину оновлено!");
                cancelEdit();
                loadNews();
            } else {
                toast.error("Помилка при оновленні.");
            }
        } else {
            // 🔥 СТВОРЕННЯ 🔥
            const res = await apiRequest('/education/news/admin/', {
                method: 'POST',
                body: formData
            });

            if (res?.ok) {
                toast.success("Новину створено! Студентам надіслано сповіщення.");
                cancelEdit();
                loadNews();
            } else {
                toast.error("Помилка при створенні.");
            }
        }
    };

    const handleEditClick = (item: NewsItem) => {
        setEditingId(item.id);
        setTitle(item.title);
        setText(item.text);
        setImage(null); // Файл скидаємо, бо ми не можемо "витягти" його з бекенду в інпут
        if (fileInputRef.current) fileInputRef.current.value = "";
        
        // Скролимо сторінку вгору до форми
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setTitle("");
        setText("");
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Ви впевнені, що хочете видалити цю новину?")) return;

        const res = await apiRequest(`/education/news/admin/${id}/`, {
            method: 'DELETE'
        });

        if (res?.ok) {
            toast.success("Новину видалено.");
            if (editingId === id) cancelEdit(); // Якщо видалили те, що зараз редагуємо
            loadNews();
        } else {
            toast.error("Помилка при видаленні.");
        }
    };

    return (
        <>
            <div className={styles.menu}>
                <Link to="/manageaccounts">Облікові записи</Link>
                <div className={styles.line}></div>
                <Link to="/managegroups">Групи</Link>
                <div className={styles.line}></div>
                <div className={styles.current}><Link to="/managenews">Новини</Link></div>
            </div>
            
            <div className={styles.container}>
                {/* ФОРМА */}
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {editingId ? "Редагування новини" : "Створення новини"}
                    </h2>
                    
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '800px' }}>
                        <input
                            className={styles.topicInput}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Заголовок новини (макс. 200 символів)"
                            maxLength={200}
                            required
                        />
                        <textarea
                            className={styles.topicInput}
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder="Текст новини..."
                            maxLength={4096}
                            rows={4}
                            required
                            style={{ resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={e => setImage(e.target.files?.[0] || null)}
                                style={{ color: 'var(--color-text)' }}
                            />
                            <button type="submit" className={styles.topicButton}>
                                {editingId ? "Зберегти зміни" : "Опублікувати"}
                            </button>
                            {editingId && (
                                <button type="button" className={styles.cancelBtn} onClick={cancelEdit}>
                                    Скасувати
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* ТАБЛИЦЯ НОВИН */}
                <div className={styles.tableWrapper} style={{ marginTop: '20px' }}>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: '15%' }}>Дата</th>
                                    <th style={{ width: '30%' }}>Заголовок</th>
                                    <th style={{ width: '40%' }}>Текст (початок)</th>
                                    <th style={{ width: '15%' }}>Дії</th>
                                </tr>
                            </thead>
                            <tbody>
                                {newsList.length === 0 ? (
                                    <tr><td colSpan={4} style={{textAlign: 'center', padding: '20px'}}>Немає створених новин</td></tr>
                                ) : (
                                    newsList.map(n => (
                                        <tr key={n.id} style={{ backgroundColor: editingId === n.id ? 'var(--color-gray)' : 'transparent' }}>
                                            <td style={{ paddingLeft: '24px', opacity: 0.7 }}>
                                                {new Date(n.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ fontWeight: 'bold' }}>{n.title}</td>
                                            <td style={{ opacity: 0.7 }}>
                                                {n.text.length > 60 ? n.text.substring(0, 60) + '...' : n.text}
                                            </td>
                                            <td>
                                                <div className={styles.actionBtns}>
                                                    <button className={styles.editBtn} onClick={() => handleEditClick(n)}>
                                                        Редагувати
                                                    </button>
                                                    <button className={styles.cancelBtn} onClick={() => handleDelete(n.id)}>
                                                        Видалити
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}