import { useState } from "react";
import { apiRequest } from "../../../shared/api/api";
import styles from './ManageAccountsCreatePage.module.css'
import { isAdministration } from "../../../entities/session/lib/jwt";
import Page403 from "../../Page403/ui/Page403";

export default function ManageAccountsCreatePage() {
    if (!isAdministration) return <Page403/>
    const [formData, setFormData] = useState({
        email: "", name: "", surname: "", patronymic: "", birthdate: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await apiRequest('/users/admin-create/', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        if (res?.ok) alert("Створено! Пароль за замовчуванням: 123456");
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>Створити новий акаунт</h2>
            <input type="email" placeholder="Email" required onChange={e => setFormData({...formData, email: e.target.value})}/>
            <input type="text" placeholder="Ім'я" required onChange={e => setFormData({...formData, name: e.target.value})}/>
            <input type="text" placeholder="Прізвище" required onChange={e => setFormData({...formData, surname: e.target.value})}/>
            <input type="text" placeholder="По батькові (необов'язково)" onChange={e => setFormData({...formData, patronymic: e.target.value})}/>
            <input type="date" required onChange={e => setFormData({...formData, birthdate: e.target.value})}/>
            <button type="submit">Створити акаунт</button>
        </form>
    );
}