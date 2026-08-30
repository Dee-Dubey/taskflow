import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { Task } from '../models/task.model';
import { environment } from '../../../environment/environment';


@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private auth = inject(AuthService)
  private socket: Socket | null = null

  isConnected = signal(false);

  taskCreated$ = new Subject<Task>();
  taskUpdated$ = new Subject<Task>();
  taskDeleted$ = new Subject<{id: string}>();

  connect(): void{
    const token = this.auth.accessToken();
    if(!token) return

    if(this.socket){
      this.socket.disconnect();
    }

    this.socket = io(environment.sockerUrl, {auth: {token}});

    this.socket.on('connect', () => this.isConnected.set(true));
    this.socket.on('disconnect', () => this.isConnected.set(false));

    this.socket.on('connect_error', (error: Error) => {
      if(error.message === 'AUTH_ON_TOKEN' || error.message === 'AUTH_INVALID_TOKEN') {
        this.auth.refresh().subscribe({
          next: () => this.connect(),
          error: () => this.disconnect()
        })
      }
    })

    this.socket.on('task:created', (task: Task) => this.taskCreated$.next(task));
    this.socket.on('task:updated', (task: Task) => this.taskUpdated$.next(task));
    this.socket.on('task:deleted', (payload: {id: string}) => this.taskDeleted$.next(payload))
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.isConnected.set(false)
  }

}
