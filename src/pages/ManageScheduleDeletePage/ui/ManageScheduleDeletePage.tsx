import { useEffect, useState } from "react"
import styles from "./ManageScheduleDelete.module.css" // Створи окремий CSS
import { apiRequest } from "../../../shared/api/api"
import { isAdministration } from "../../../entities/session/lib/jwt";
import Page403 from "../../Page403/ui/Page403";
import { Link } from "react-router-dom";

interface LessonRow {
    id: string;
    group_name: string;
    teacher_name: string;
    subject_name: string;
    start: string;
    end: string;
    classroom: string;
    teacher_id: string;
}

export default function ManageScheduleDelete() {
    if (!isAdministration()) return <Page403 />
    const [teachers, setTeachers] = useState<{ id: string, name: string }[]>([])
    const [groups, setGroups] = useState<{ id: string, name: string }[]>([])
    const [lessons, setLessons] = useState<LessonRow[]>([])

    const [filterTeacher, setFilterTeacher] = useState("")
    const [filterGroup, setFilterGroup] = useState("")

    useEffect(() => {
        // Завантаження довідників
        apiRequest('/education/all-teachers/').then(res => res?.json()).then(setTeachers)
        apiRequest('/education/all-groups/').then(res => res?.json()).then(setGroups)
    }, [])

    const fetchLessons = async () => {
        const query = new URLSearchParams()
        if (filterTeacher) query.append('teacher', filterTeacher)
        if (filterGroup) query.append('group', filterGroup)

        const res = await apiRequest(`/education/lessons/filter/?${query.toString()}`)
        const data = await res?.json()
        setLessons(data || [])
    }

    const handleDelete = async (id: string) => {
        const res = await apiRequest(`/education/lessons/detail/${id}/`, { method: 'DELETE' })
        if (res?.ok) fetchLessons()
    }

    const handleUpdateClassroom = async (id: string, newRoom: string) => {
        await apiRequest(`/education/lessons/detail/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify({ classroom: newRoom })
        })
    }

    return (
        <>
        <title>Quack | Змінити розклад</title>
            <div className={styles.menu}>
                <Link to="/manageschedule">Створити пару</Link>
                <div className={styles.line}></div>
                <div className={styles.current}><Link to="">Змінити</Link></div>
            </div>
            <div className={styles.container}>
                <div className={styles.filters}>
                    <select value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)}>
                        <option value="">Всі викладачі</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>

                    <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
                        <option value="">Всі групи</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>

                    <button onClick={fetchLessons} className={styles.searchBtn}>Пошук</button>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Час</th>
                                <th>Група</th>
                                <th>Предмет</th>
                                <th>Викладач</th>
                                <th>Аудиторія</th>
                                <th>Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lessons.map(l => (
                                <tr key={l.id}>
                                    <td>
                                        {new Date(l.start).toLocaleString('uk-UA', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false
                                        }).replace(',', '')}
                                        -
                                        {new Date(l.end).toLocaleString('uk-UA', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false
                                        })}
                                    </td>
                                    <td>{l.group_name}</td>
                                    <td>{l.subject_name}</td>
                                    <td>
                                        <select
                                            className={styles.miniSelect}
                                            defaultValue={l.teacher_id}
                                            onChange={(e) => apiRequest(`/education/lessons/detail/${l.id}/`, {
                                                method: 'PATCH',
                                                body: JSON.stringify({ teacher: e.target.value })
                                            })}
                                        >
                                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            className={styles.miniInput}
                                            defaultValue={l.classroom}
                                            onBlur={(e) => handleUpdateClassroom(l.id, e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete(l.id)} className={styles.deleteBtn}>Видалити</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}