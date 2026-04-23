import React, { useState, useEffect } from 'react';
import styles from './ManageSubjectsPage.module.css';
import { apiRequest } from '../../../shared/api/api';
import { isAdministration } from '../../../entities/session/lib/jwt';
import Page403 from '../../Page403/ui/Page403';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ManageSubjectsPage() {
    if (!isAdministration()) return <Page403 />;

    const [subjects, setSubjects] = useState<any[]>([]);
    const [newName, setNewName] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const loadData = async () => {
        // Отримуємо список предметів
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

        try {
            const res = await apiRequest('/education/admin-subjects/', {
                method: 'POST',
                body: JSON.stringify({ name })
            });
            if (res?.ok) {
                toast.success("Предмет створено");
                setNewName("");
                loadData();
            } else {
                toast.error("Помилка створення предмета");
            }
        } catch { toast.error("Помилка сервера"); }
    };

    const handleUpdate = async (id: string) => {
        const name = editName.trim();
        if (!name) return;

        try {
            const res = await apiRequest(`/education/admin-subjects/${id}/`, {
                method: 'PATCH',
                body: JSON.stringify({ name })
            });
            if (res?.ok) {
                toast.success("Назву оновлено");
                setEditingId(null);
                loadData();
            } else {
                toast.error("Помилка оновлення");
            }
        } catch { toast.error("Помилка сервера"); }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await apiRequest(`/education/admin-subjects/${id}/`, {
                method: 'DELETE'
            });
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
                                    <th style={{ width: '70%', textAlign: 'left', paddingLeft: '24px' }}>Назва предмета</th>
                                    <th>Дії</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map(s => (
                                    <tr key={s.id}>
                                        {editingId === s.id ? (
                                            <>
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
                                                        <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>✖</button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className={styles.groupName}>{s.name}</td>
                                                <td>
                                                    <div className={styles.actionBtns}>
                                                        <button className={styles.editBtn} onClick={() => {
                                                            setEditingId(s.id);
                                                            setEditName(s.name);
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
                                        <td colSpan={2} style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>
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