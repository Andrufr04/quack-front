import React, { useState, useEffect, useRef } from 'react';
import styles from './ManageSubjectsPage.module.css';
import { apiRequest } from '../../../shared/api/api';
import { isAdministration } from '../../../entities/session/lib/jwt';
import Page403 from '../../Page403/ui/Page403';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ManageSubjectsPage() {
    if (!isAdministration()) return <Page403 />;

    const [subjects, setSubjects] = useState<any[]>([]);
    
    // Стейт для створення
    const [newName, setNewName] = useState("");
    const [newImage, setNewImage] = useState<File | null>(null);
    const newImageInputRef = useRef<HTMLInputElement>(null);

    // Стейт для редагування
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editImage, setEditImage] = useState<File | null>(null);
    const editImageInputRef = useRef<HTMLInputElement>(null);

    const loadData = async () => {
        const res = await apiRequest('/education/admin-subjects/');
        if (res?.ok) {
            const data = await res.json();
            setSubjects(data);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newName.trim();
        if (!name) return;

        const formData = new FormData();
        formData.append('name', name);
        if (newImage) formData.append('image', newImage);

        try {
            const res = await apiRequest('/education/admin-subjects/', {
                method: 'POST',
                body: formData // 🔥 ВИКОРИСТОВУЄМО FormData
            });
            if (res?.ok) {
                toast.success("Предмет створено");
                setNewName("");
                setNewImage(null);
                if (newImageInputRef.current) newImageInputRef.current.value = "";
                loadData();
            } else {
                toast.error("Помилка створення предмета");
            }
        } catch { toast.error("Помилка сервера"); }
    };

    const handleUpdate = async (id: string) => {
        const name = editName.trim();
        if (!name) return;

        const formData = new FormData();
        formData.append('name', name);
        if (editImage) formData.append('image', editImage);

        try {
            const res = await apiRequest(`/education/admin-subjects/${id}/`, {
                method: 'PATCH',
                body: formData // 🔥 ВИКОРИСТОВУЄМО FormData
            });
            if (res?.ok) {
                toast.success("Предмет оновлено");
                setEditingId(null);
                setEditImage(null);
                loadData();
            } else {
                toast.error("Помилка оновлення");
            }
        } catch { toast.error("Помилка сервера"); }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await apiRequest(`/education/admin-subjects/${id}/`, { method: 'DELETE' });
            if (res?.ok) {
                toast.success("Предмет видалено");
                loadData();
            } else {
                toast.error("Помилка видалення");
            }
        } catch { toast.error("Помилка сервера"); }
    };

    return (
        <>
        <title>Quack | Керування предметами</title>
            <div className={styles.menu}>
                <Link to="/manageaccounts">Облікові записи</Link>
                <div className={styles.line}></div>
                <Link to="/managegroups">Групи</Link>
                <div className={styles.line}></div>
                <div className={styles.current}><Link to="/managesubjects">Предмети</Link></div>
                <div className={styles.line}></div>
                <Link to="/managetasktypes">Типи завдань</Link>
                <div className={styles.line}></div>
                <Link to="/managelessontypes">Типи занять</Link>
                <div className={styles.line}></div>
                <Link to="/managenews">Новини</Link>
            </div>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Керування предметами</h2>
                    <form onSubmit={handleCreate} className={styles.createForm}>
                        
                        {/* Кнопка вибору картинки */}
                        <div 
                            className={styles.imagePicker} 
                            onClick={() => newImageInputRef.current?.click()}
                            style={newImage ? { backgroundImage: `url(${URL.createObjectURL(newImage)})`} : {}}
                        >
                            {!newImage && <span>+ Фото</span>}
                        </div>
                        <input 
                            type="file" hidden accept="image/*" ref={newImageInputRef}
                            onChange={e => e.target.files && setNewImage(e.target.files[0])}
                        />

                        <input
                            className={styles.topicInput}
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Назва нового предмета..."
                            maxLength={150}
                            required
                        />
                        <button type="submit" className={styles.topicButton}>Створити</button>
                    </form>
                </div>

                <div className={styles.tableWrapper}>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: '10%' }}>Обкладинка</th>
                                    <th style={{ width: '60%', textAlign: 'left', paddingLeft: '24px' }}>Назва предмета</th>
                                    <th>Дії</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map(s => (
                                    <tr key={s.id}>
                                        {editingId === s.id ? (
                                            <>
                                                {/* Редагування */}
                                                <td>
                                                    <div 
                                                        className={styles.imagePickerSmall} 
                                                        onClick={() => editImageInputRef.current?.click()}
                                                        style={{ 
                                                            backgroundImage: editImage 
                                                                ? `url(${URL.createObjectURL(editImage)})` 
                                                                : (s.image ? `url(${s.image})` : 'none')
                                                        }}
                                                    >
                                                        {!editImage && !s.image && <span>+</span>}
                                                    </div>
                                                    <input 
                                                        type="file" hidden accept="image/*" ref={editImageInputRef}
                                                        onChange={e => e.target.files && setEditImage(e.target.files[0])}
                                                    />
                                                </td>
                                                <td>
                                                    <input 
                                                        className={styles.editInput} 
                                                        value={editName} 
                                                        maxLength={150}
                                                        autoFocus
                                                        onChange={e => setEditName(e.target.value)} 
                                                        onKeyDown={e => e.key === 'Enter' && handleUpdate(s.id)}
                                                    />
                                                </td>
                                                <td>
                                                    <div className={styles.actionBtns}>
                                                        <button className={styles.saveBtn} onClick={() => handleUpdate(s.id)}>OK</button>
                                                        <button className={styles.cancelBtn} onClick={() => {
                                                            setEditingId(null);
                                                            setEditImage(null);
                                                        }}>✖</button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                {/* Відображення */}
                                                <td>
                                                    <div 
                                                        className={styles.subjectImageDisplay} 
                                                        style={{ backgroundImage: s.image ? `url(${s.image})` : 'none' }}
                                                    >
                                                        {!s.image && <span style={{opacity: 0.3}}>Немає</span>}
                                                    </div>
                                                </td>
                                                <td className={styles.groupName}>{s.name}</td>
                                                <td>
                                                    <div className={styles.actionBtns}>
                                                        <button className={styles.editBtn} onClick={() => {
                                                            setEditingId(s.id);
                                                            setEditName(s.name);
                                                            setEditImage(null);
                                                        }}>Редагувати</button>
                                                        <button className={styles.deleteBtn} onClick={() => handleDelete(s.id)}>Видалити</button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                                {subjects.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>
                                            Немає предметів
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}