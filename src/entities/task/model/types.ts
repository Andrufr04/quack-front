export interface AttachmentFile {
    id: string
    file: string
}

export interface AttachmentGroup {
    id: string
    files: AttachmentFile[]
}

export interface Task {
    id: string
    author_name: string
    subject_name: string
    subject_image?: string | null;
    task_type_name?: string
    theme: string
    description: string
    start: string
    end: string
    attachments?: AttachmentGroup
}

export interface TaskStatus {
    id: string
    task: Task
    status: 0 | 1 | 2 | 3 // 0: Виконується, 1: На перевірці, 2: Перевірено, 3: Видалено
    mark?: number | null
    comment?: string | null
    submitted_text?: string | null
    submitted_attachments?: AttachmentGroup
}

export interface TaskOnCheck {
    id: string
    task_id: string
    student_id: string
    text?: string
    submitted_at: string
    attachments?: AttachmentGroup
}

export interface TeacherTaskToCheck {
    id: string;
    student_name: string;
    group_name: string;
    task_theme: string;
    submitted_at: string;
    text?: string;
    attachments?: AttachmentGroup;
    task: Task;
}