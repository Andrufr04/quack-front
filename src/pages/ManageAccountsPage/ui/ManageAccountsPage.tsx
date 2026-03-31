import { useState, useEffect } from 'react';
import styles from './ManageAccountsPage.module.css';
import { apiRequest } from '../../../shared/api/api';
import { getSessionInfo, isAdministration } from '../../../entities/session/lib/jwt';
import Page403 from '../../Page403/ui/Page403';
import { Link } from 'react-router-dom';

export default function ManageAccountsPage() {
    if (!isAdministration()) return <Page403 />;

    const [users, setUsers] = useState<any[]>([]);
    const [availableGroups, setAvailableGroups] = useState<any[]>([]);
    const [newUser, setNewUser] = useState({
        email: "", name: "", surname: "", patronymic: "", birthdate: ""
    });

    const rolesList = ["student", "teacher", "curator", "administration"];

    const loadData = async () => {
        const [uRes, gRes] = await Promise.all([
            apiRequest('/users/manage/'),
            apiRequest('/education/all-groups/') // Використовуємо твій AllGroupsView
        ]);

        if (uRes?.ok) setUsers(await uRes.json());
        if (gRes?.ok) setAvailableGroups(await gRes.json());
    };

    useEffect(() => { loadData(); }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await apiRequest('/users/admin-create/', {
            method: 'POST',
            body: JSON.stringify(newUser)
        });
        if (res?.ok) {
            setNewUser({ email: "", name: "", surname: "", patronymic: "", birthdate: "" });
            loadData();
        }
    };

    const toggleRole = async (userId: string, currentRoles: string[], role: string) => {
        let newRoles = currentRoles.includes(role)
            ? currentRoles.filter(r => r !== role)
            : [...currentRoles, role];

        await apiRequest(`/users/manage/${userId}/`, {
            method: 'PATCH',
            body: JSON.stringify({ roles: newRoles })
        });
        loadData();
    };

    const toggleActive = async (userId: string) => {
        await apiRequest(`/users/manage/${userId}/`, {
            method: 'PATCH',
            body: JSON.stringify({ action: 'toggle_active' })
        });
        loadData();
    };

    const updateGroup = async (userId: string, groupId: string) => {
        await apiRequest(`/users/manage/${userId}/`, {
            method: 'PATCH',
            body: JSON.stringify({ study_group: groupId || null })
        });
        loadData();
    };

    return (
        <>
            <div className={styles.menu}>
                <div className={styles.current}><Link to="/manageaccounts">Облікові записи</Link></div>
                <div className={styles.line}></div>
                <Link to="/managegroups">Групи</Link>
            </div>

            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Керування користувачами</h2>

                    <form onSubmit={handleCreateUser} className={styles.createForm}>
                        <input
                            type="email" placeholder="Email" required
                            value={newUser.email}
                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                        />
                        <input
                            type="text" placeholder="Прізвище" required
                            value={newUser.surname}
                            onChange={e => setNewUser({ ...newUser, surname: e.target.value })}
                        />
                        <input
                            type="text" placeholder="Ім'я" required
                            value={newUser.name}
                            onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                        />
                        <input
                            type="date" required
                            value={newUser.birthdate}
                            onChange={e => setNewUser({ ...newUser, birthdate: e.target.value })}
                        />
                        <button type="submit" className={styles.addBtn}>Додати</button>
                    </form>
                </div>

                <div className={styles.tableWrapper}>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Користувач</th>
                                    <th>Email</th>
                                    <th>Ролі</th>
                                    <th>Група</th>
                                    <th>Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className={!u.is_active ? styles.inactiveRow : ""}>
                                        <td className={styles.userName}>{u.full_name}</td>
                                        <td className={styles.email}>{u.email}</td>
                                        <td>
                                            <div className={styles.rolesRow}>
                                                {rolesList.map(role => (
                                                    <button
                                                        key={role}
                                                        className={`${styles.roleBtn} ${u.roles.includes(role) ? styles.roleActive : styles.roleInactive}`}
                                                        onClick={() => toggleRole(u.id, u.roles, role)}
                                                        disabled={u.id === getSessionInfo()?.userId && role === 'administration'}
                                                    >
                                                        {role === 'administration' ? 'admin' : role}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            {u.roles.includes('student') ? (
                                                <select
                                                    value={u.group?.id || ""}
                                                    onChange={(e) => updateGroup(u.id, e.target.value)}
                                                    className={styles.groupSelect}
                                                >
                                                    <option value=""> Оберіть </option>
                                                    {availableGroups.map(g => (
                                                        <option key={g.id} value={g.id}>{g.name}</option>
                                                    ))}
                                                </select>
                                            ) : "—"}
                                        </td>
                                        <td>
                                            <button
                                                className={u.is_active ? styles.deactivateBtn : styles.activateBtn}
                                                onClick={() => toggleActive(u.id)}
                                                disabled={u.id === getSessionInfo()?.userId}
                                            >
                                                {u.is_active ? "Вимкнути" : "Увімкнути"}
                                            </button>
                                        </td>
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