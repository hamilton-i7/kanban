export type Board = {
    id: number;
    name: string;
    created_at: string;
    last_modified: string;
}

export type Column = {
    id: number;
    name: string;
    board_id: string;
    created_at: string;
    last_modified: string;
}

export type Task = {
    id: number;
    title: string;
    description: string;
    column_id: string;
    created_at: string;
    last_modified: string;
}

export type Subtask = {
    id: number;
    title: string;
    task_id: string;
    status: boolean;
    created_at: string;
    last_modified: string;
}