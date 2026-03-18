import { apiRequest } from "../../../shared/api/api";
import type { TaskStatus, TaskOnCheck, TeacherTaskToCheck } from "../model/types";

const BASE_PATH = '/education';

export const taskApi = {
    /** * Отримання завдань студентом
     * 0 - виконується, 1 - на перевірці, 2 - перевірено, 3 - видалено
     * URL: /api/education/tasks/my-tasks/
     */
    getStudentTasks: async (status?: number): Promise<TaskStatus[]> => {
        const query = status !== undefined ? `?status=${status}` : '';
        const res = await apiRequest(`${BASE_PATH}/tasks/my-tasks/${query}`);
        if (!res) return [];
        return res.json();
    },

    getTasksToCheck: async (group?: string): Promise<TeacherTaskToCheck[]> => {
        // Якщо вибрана конкретна група, додаємо її в query-параметри
        const query = group && group !== "Всі" ? `?group=${group}` : '';

        const res = await apiRequest(`${BASE_PATH}/tasks/to-check/${query}`);

        if (!res) return [];
        return res.json();
    },

    /** * Створення завдання
     * URL: /api/education/tasks/create/
     */
    createTask: async (formData: FormData) => {
        const res = await apiRequest(`${BASE_PATH}/tasks/create/`, {
            method: 'POST',
            body: formData,
        });
        if (!res) return null;
        return res.json();
    },

    /** * Відповідь студента
     * URL: /api/education/tasks/submit/
     */
    submitTaskWork: async (formData: FormData) => {
        const res = await apiRequest(`${BASE_PATH}/tasks/submit/`, {
            method: 'POST',
            body: formData,
        });
        if (!res) return null;
        return res.json();
    },

    /** * Оцінювання
     * URL: /api/education/tasks/grade/<id>/
     */
    gradeTaskWork: async (submissionId: string, data: { mark: number; comment?: string }) => {
        const res = await apiRequest(`${BASE_PATH}/tasks/grade/${submissionId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!res) return null;
        return res.json();
    },

    /** * Список груп вчителя
     * URL: /api/education/my-groups/
     */
    getTeacherGroups: async (): Promise<{ id: string, name: string }[]> => {
        const res = await apiRequest(`${BASE_PATH}/my-groups/`);
        if (!res) return [];
        return res.json();
    },

    /** * Список предметів вчителя в групі
     * URL: /api/education/my-subjects/?group_id=...
     */
    getTeacherSubjectsByGroup: async (groupId: string): Promise<{ id: string, name: string }[]> => {
        const res = await apiRequest(`${BASE_PATH}/my-subjects/?group_id=${groupId}`);
        if (!res) return [];
        return res.json();
    },

    getTaskTypes: async (): Promise<{ id: string, name: string }[]> => {
        const res = await apiRequest(`${BASE_PATH}/types/`);
        if (!res) return [];
        return res.json();
    },
};