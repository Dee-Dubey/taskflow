export type Role = 'manager' | 'teamlead' | 'employee';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  reportsTo: string | null;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role: Role;
}

export interface ReportsToOption {
  _id: string,
  username: string
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TaskStats {
  pending: number;
  inProgress: number;
  completed: number;
  total: number;
}


export interface TeamMemberOverview {
  _id: string;
  username: string;
  email: string;
  role: Role;
  stats: TaskStats
}

export interface UserOverview extends TeamMemberOverview {
  reportsCount: number
}