import React, { useState, useEffect } from 'react';
import styles from './ManageGroupsPage.module.css';
import { apiRequest } from '../../../shared/api/api';

export default function ManageGroupsPage() {
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
        <div className={styles.container}>
            <h2>Керування групами</h2>
            
            <form onSubmit={handleCreate} className={styles.createRow}>
                <input 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                    placeholder="Назва групи"
                    required
                />
                <select value={selectedCurator} onChange={e => setSelectedCurator(e.target.value)}>
                    <option value="">Без куратора</option>
                    {curators.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
                <button type="submit">Створити</button>
            </form>

            <div className={styles.table}>
                {groups.map(g => (
                    <div key={g.id} className={styles.row}>
                        {editingId === g.id ? (
                            <>
                                <input value={editName} onChange={e => setEditName(e.target.value)} />
                                <select value={editCurator} onChange={e => setEditCurator(e.target.value)}>
                                    <option value="">Без куратора</option>
                                    {curators.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                                </select>
                                <button onClick={() => handleUpdate(g.id)}>Зберегти</button>
                                <button onClick={() => setEditingId(null)}>Скасувати</button>
                            </>
                        ) : (
                            <>
                                <span className={styles.name}>{g.name}</span>
                                <span className={styles.curator}>Куратор: {g.curator_name}</span>
                                <button onClick={() => {
                                    setEditingId(g.id);
                                    setEditName(g.name);
                                    setEditCurator(g.curator_id || "");
                                }}>Редагувати</button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}