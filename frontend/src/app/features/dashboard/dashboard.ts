import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Task } from '../../core/models/task.model';
import { getAvatarColor, getInitials } from '../../shared/utils/avatar.util';
import { DatePipe } from '@angular/common';
import { RoleBadge } from '../../shared/components/role-badge/role-badge';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { SocketService } from '../../core/services/socket.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink, StatusBadge, RoleBadge],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private taskService = inject(TaskService)
  private router = inject(Router);
  private socketService = inject(SocketService);
  private destroyRef = inject(DestroyRef);
  auth = inject(AuthService);

  tasks = signal<Task[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  total = computed(() => this.tasks().length);
  pending = computed(()=> this.tasks().filter((t)=> t.status === 'pending').length);
  inProgress = computed(() => this.tasks().filter((t) => t.status === 'in-progress').length);
  completed = computed(() => this.tasks().filter((t) => t.status === 'completed').length);
  completionPct = computed(()=> {
    return this.total() === 0 ? 0 : Math.round((this.completed() / this.total()) * 100)
  })

  


  recentActivity = computed(()=> [...this.tasks()].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5))

  get greetingName(): string {
    return this.auth.currentUser()?.username ?? '';
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Could not load task');
        this.isLoading.set(false);
      }
    })

    const refetch = () => {
      this.taskService.getTasks().subscribe({ next: (tasks) => this.tasks.set(tasks)})
    }  

    this.socketService.taskCreated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(refetch);
    this.socketService.taskUpdated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(refetch);
    this.socketService.taskDeleted$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(refetch);
  }


  initialsFor(name :string): string{
    return getInitials(name)
  }

  colorFor(name: string): string {
    return getAvatarColor(name)
  }

}
