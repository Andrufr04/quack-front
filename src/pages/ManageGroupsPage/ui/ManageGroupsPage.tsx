import React, { useState, useEffect } from 'react';
import styles from './ManageGroupsPage.module.css';
import { apiRequest } from '../../../shared/api/api';
import { isAdministration } from '../../../entities/session/lib/jwt';
import Page403 from '../../Page403/ui/Page403';
import { Link } from 'react-router-dom';

export default function ManageGroupsPage() {
    if (!isAdministration()) return <Page403 />

    const [groups, setGroups] = useState<any[]>([]);
    const [curators, setCurators] = useState<any[]>([]);
    const [newName, setNewName] = useState("");
    const [selectedCurator, setSelectedCurator] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editCurator, setEditCurator] = useState("");

    const loadData = async () => {
        const res = await apiRequest('/education/groups/');
        const data = await res?.json();
        if (data) {
            setGroups(data.groups);
            setCurators(data.available_curators);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await apiRequest('/education/groups/', {
            method: 'POST',
            body: JSON.stringify({ name: newName, curator_id: selectedCurator })
        });
        setNewName("");
        setSelectedCurator("");
        loadData();
    };

    const handleUpdate = async (id: string) => {
        await apiRequest(`/education/groups/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify({ name: editName, curator_id: editCurator })
        });
        setEditingId(null);
        loadData();
    };

    return (
        <>
            <div className={styles.menu}>
                <Link to="/manageaccounts">Облікові записи</Link>
                <div className={styles.line}></div>
                <div className={styles.current}><Link to="/managegroups">Групи</Link></div>
                <div className={styles.line}></div>
                <Link to="/managenews">Новини</Link>
            </div>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Керування групами</h2>
                    <form onSubmit={handleCreate} className={styles.createForm}>
                        <input
                            className={styles.topicInput}
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Назва нової групи"
                            required
                        />
                        <select
                            className={styles.selectCurator}
                            value={selectedCurator}
                            onChange={e => setSelectedCurator(e.target.value)}
                        >
                            <option value="">Без куратора</option>
                            {curators.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                        </select>
                        <button type="submit" className={styles.topicButton}>Створити</button>
                    </form>
                </div>

                <div className={styles.tableWrapper}>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Назва групи</th>
                                    <th>Куратор</th>
                                    <th>Дії</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups.map(g => (
                                    <tr key={g.id}>
                                        {editingId === g.id ? (
                                            <>
                                                <td>
                                                    <input className={styles.editInput} value={editName} onChange={e => setEditName(e.target.value)} />
                                                </td>
                                                <td>
                                                    <select className={styles.mark} value={editCurator} onChange={e => setEditCurator(e.target.value)}>
                                                        <option value="">Без куратора</option>
                                                        {curators.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                                                    </select>
                                                </td>
                                                <td>
                                                    <div className={styles.actionBtns}>
                                                        <button className={styles.saveBtn} onClick={() => handleUpdate(g.id)}>OK</button>
                                                        <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>✖</button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className={styles.groupName}>{g.name}</td>
                                                <td className={styles.curatorName}>{g.curator_name}</td>
                                                <td>
                                                    <button className={styles.editBtn} onClick={() => {
                                                        setEditingId(g.id);
                                                        setEditName(g.name);
                                                        setEditCurator(g.curator_id || "");
                                                    }}>Редагувати</button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}