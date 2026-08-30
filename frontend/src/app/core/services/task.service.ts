import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { filter, Observable } from 'rxjs';
import { Task, TaskFormPayload } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);
  private base = environment.apiUrl


  getTasks(filters: {status?: string, assignedTo?: string } = {}): Observable<Task[]>{
    let params = new HttpParams();
    if(filters.status) params = params.set('status', filters.status);
    if(filters.assignedTo) params = params.set('assignedTo', filters.assignedTo);
    return this.http.get<Task[]>(`${this.base}/tasks`, {params});
  }

  createTask(payload: TaskFormPayload): Observable<Task>{
    return this.http.post<Task>(`${this.base}/tasks`, payload)
  }

  updateTask(id: string, payload: Partial<TaskFormPayload>): Observable<Task>{
    const {assignedTo, ...rest} = payload
    return this.http.put<Task>(`${this.base}/tasks/${id}`, rest)
  }

  reassignTask(id: string, assignedTo: string): Observable<Task>{
    return this.http.patch<Task>(`${this.base}/tasks/${id}/reassign`, {assignedTo});
  }


  deleteTask(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/tasks/${id}`);
  }
}

