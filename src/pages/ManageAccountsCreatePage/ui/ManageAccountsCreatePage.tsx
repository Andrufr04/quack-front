import { useState } from "react";
import { apiRequest } from "../../../shared/api/api";
import styles from './ManageAccountsCreatePage.module.css';
import { isAdministration } from "../../../entities/session/lib/jwt";
import Page403 from "../../Page403/ui/Page403";
import toast from "react-hot-toast";

export default function ManageAccountsCreatePage() {
    if (!isAdministration()) return <Page403 />;

    const [formData, setFormData] = useState({
        email: "", name: "", surname: "", patronymic: "", birthdate: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await apiRequest('/users/admin-create/', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        if (res?.ok) {
            toast.success("Акаунт успішно створено! Пароль за замовчуванням: 123456")
            setFormData({ email: "", name: "", surname: "", patronymic: "", birthdate: "" });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Створити новий акаунт</h2>
                    {/* <p className={styles.subtitle}>Пароль за замовчуванням буде встановлено як <b>123456</b></p> */}
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGrid}>
                        <div className={styles.field}>
                            <label>Електронна пошта</label>
                            <input 
                                type="email" 
                                placeholder="cooluser@cat.dog" 
                                value={formData.email}
                                required 
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Прізвище</label>
                            <input 
                                type="text" 
                                placeholder="Петренко" 
                                value={formData.surname}
                                required 
                                onChange={e => setFormData({...formData, surname: e.target.value})}
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Ім'я</label>
                            <input 
                                type="text" 
                                placeholder="Іван" 
                                value={formData.name}
                                required 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div className={styles.field}>
                            <label>По батькові</label>
                            <input 
                                type="text" 
                                placeholder="Миколайович" 
                                value={formData.patronymic}
                                onChange={e => setFormData({...formData, patronymic: e.target.value})}
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Дата народження</label>
                            <input 
                                type="date" 
                                value={formData.birthdate}
                                required 
                                onChange={e => setFormData({...formData, birthdate: e.target.value})}
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.submitButton}>
                        Зареєструвати користувача
                    </button>
                </form>
            </div>
        </div>
    );
}