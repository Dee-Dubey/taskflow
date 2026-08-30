import { Role } from "./user.model";

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface TaskUserRef {
    _id: string;
    username: string;
    email: string;
    role: Role;
}

export interface Task {
    _id: string;
    title: string;
    description: string;
    status: TaskStatus;
    createdBy: TaskUserRef;
    assignedTo: TaskUserRef;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TaskFormPayload {
    title: string;
    description: string;
    status: TaskStatus;
    dueDate?: string | null;
    assignedTo?: string;
}