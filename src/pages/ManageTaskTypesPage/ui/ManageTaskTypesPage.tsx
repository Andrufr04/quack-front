import React, { useState, useEffect } from 'react';
import styles from './ManageTaskTypesPage.module.css';
import { apiRequest } from '../../../shared/api/api';
import { isAdministration } from '../../../entities/session/lib/jwt';
import Page403 from '../../Page403/ui/Page403';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ManageTaskTypesPage() {
    if (!isAdministration()) return <Page403 />;

    const [taskTypes, setTaskTypes] = useState<any[]>([]);
    const [newName, setNewName] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const loadData = async () => {
        const res = await apiRequest('/education/admin-task-types/');
        if (res?.ok) {
            const data = await res.json();
            setTaskTypes(data);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newName.trim();
        if (!name) return;

        try {
            const res = await apiRequest('/education/admin-task-types/', {
                method: 'POST',
                body: JSON.stringify({ name })
            });
            if (res?.ok) {
                toast.success("Тип завдання створено");
                setNewName("");
                loadData();
            } else {
                toast.error("Помилка створення");
            }
        } catch { toast.error("Помилка сервера"); }
    };

    const handleUpdate = async (id: string) => {
        const name = editName.trim();
        if (!name) return;

        try {
            const res = await apiRequest(`/education/admin-task-types/${id}/`, {
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
            const res = await apiRequest(`/education/admin-task-types/${id}/`, {
                method: 'DELETE'
            });
            if (res?.ok) {
                toast.success("Видалено");
                loadData();
            } else {
                toast.error("Помилка видалення");
            }
        } catch { toast.error("Помилка сервера"); }
    };

    return (
        <>
        <title>Quack | Керування типами предметів</title>
            <div className={styles.menu}>
                <Link to="/manageaccounts">Облікові записи</Link>
                <div className={styles.line}></div>
                <Link to="/managegroups">Групи</Link>
                <div className={styles.line}></div>
                <Link to="/managesubjects">Предмети</Link>
                <div className={styles.line}></div>
                <div className={styles.current}><Link to="/managetasktypes">Типи завдань</Link></div>
                <div className={styles.line}></div>
                <Link to="/managelessontypes">Типи занять</Link>
                <div className={styles.line}></div>
                <Link to="/managenews">Новини</Link>
            </div>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Керування типами завдань</h2>
                    <form onSubmit={handleCreate} className={styles.createForm}>
                        <input
                            className={styles.topicInput}
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Назва типу"
                            maxLength={100}
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
                                    <th style={{ width: '70%', textAlign: 'left', paddingLeft: '24px' }}>Тип завдання</th>
                                    <th>Дії</th>
                                </tr>
                            </thead>
                            <tbody>
                                {taskTypes.map(t => (
                                    <tr key={t.id}>
                                        {editingId === t.id ? (
                                            <>
                                                <td>
                                                    <input 
                                                        className={styles.editInput} 
                                                        value={editName} 
                                                        maxLength={100}
                                                        autoFocus
                                                        onChange={e => setEditName(e.target.value)} 
                                                        onKeyDown={e => e.key === 'Enter' && handleUpdate(t.id)}
                                                    />
                                                </td>
                                                <td>
                                                    <div className={styles.actionBtns}>
                                                        <button className={styles.saveBtn} onClick={() => handleUpdate(t.id)}>OK</button>
                                                        <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>✖</button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className={styles.groupName}>{t.name}</td>
                                                <td>
                                                    <div className={styles.actionBtns}>
                                                        <button className={styles.editBtn} onClick={() => {
                                                            setEditingId(t.id);
                                                            setEditName(t.name);
                                                        }}>Редагувати</button>
                                                        <button className={styles.deleteBtn} onClick={() => handleDelete(t.id)}>Видалити</button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                                {taskTypes.length === 0 && (
                                    <tr>
                                        <td colSpan={2} style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>
                                            Немає типів завдань
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