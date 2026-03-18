import { useState, useEffect } from 'react';
import styles from './ManageAccountsPage.module.css'
import { apiRequest } from '../../../shared/api/api';
import { isAdministration } from '../../../entities/session/lib/jwt';
import Page403 from '../../Page403/ui/Page403';

export default function ManageAccountsPage() {
    if (!isAdministration) return <Page403/>

    const [users, setUsers] = useState<any[]>([]);
    const rolesList = ["student", "teacher", "curator", "administration"];

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = () => apiRequest('/users/manage/').then(r => r?.json()).then(setUsers);

    const toggleRole = async (userId: string, currentRoles: string[], role: string) => {
        let newRoles;
        if (currentRoles.includes(role)) {
            newRoles = currentRoles.filter(r => r !== role);
        } else {
            newRoles = [...currentRoles, role];
        }
        
        await apiRequest(`/users/manage/${userId}/`, {
            method: 'PATCH',
            body: JSON.stringify({ roles: newRoles })
        });
        loadUsers();
    };

    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>Користувач</th>
                    <th>Email</th>
                    <th>Ролі</th>
                    <th>Статус</th>
                </tr>
            </thead>
            <tbody>
                {users.map(u => (
                    <tr key={u.id} className={!u.is_active ? styles.inactive : ""}>
                        <td>{u.full_name}</td>
                        <td>{u.email}</td>
                        <td>
                            {rolesList.map(role => (
                                <button 
                                    key={role}
                                    className={u.roles.includes(role) ? styles.roleActive : styles.roleInactive}
                                    onClick={() => toggleRole(u.id, u.roles, role)}
                                >
                                    {role}
                                </button>
                            ))}
                        </td>
                        <td>
                            <button onClick={() => apiRequest(`/users/manage/${u.id}/`, {
                                method: 'PATCH', body: JSON.stringify({ action: 'toggle_active' })
                            }).then(loadUsers)}>
                                {u.is_active ? "Деактивувати" : "Активувати"}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}