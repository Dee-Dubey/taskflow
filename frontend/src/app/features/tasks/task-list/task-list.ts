import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TaskService } from '../../../core/services/task.service';
import { Task, TaskStatus, TaskUserRef } from '../../../core/models/task.model';
import { TaskFormModal } from '../task-form-modal/task-form-modal';
import { getAvatarColor, getInitials } from '../../../shared/utils/avatar.util';
import { FormsModule } from '@angular/forms';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { DatePipe } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { TaskDetailModal } from '../task-detail-modal/task-detail-modal';
import { SocketService } from '../../../core/services/socket.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-task-list',
  imports: [DatePipe, FormsModule, StatusBadge],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList implements OnInit {
  private taskService = inject(TaskService);
  private userService = inject(UserService);
  private modalService = inject(NgbModal);
  private socketService = inject(SocketService);
  private destroyRef = inject(DestroyRef);
  auth = inject(AuthService);


  tasks = signal<Task[]>([]);
  assignableUsers = signal<TaskUserRef[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null)

  searchTerm = signal('');
  statusFilter = signal<TaskStatus | ''>('');
  assigneeFilter = signal<string>('');

  get canFilterByAssignee(): boolean {
    return this.auth.currentUser()?.role !== 'employee';
  }

  filteredTasks = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();
    const assignee = this.assigneeFilter();
    return this.tasks().filter((t) => {
      const matchesSearch = !term || t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term);
      const matchesStatus = !status || t.status === status
      const matchesAssignee = !assignee || t.assignedTo._id === assignee;
      return matchesSearch && matchesStatus && matchesAssignee
    })
  })

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.loadTasks();
    if (this.canFilterByAssignee) {
      this.userService.getAssignableUsers().subscribe({ next: (users) => this.assignableUsers.set(users) });
    }
    this.socketService.taskCreated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadTasks());
    this.socketService.taskUpdated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadTasks());
    this.socketService.taskDeleted$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadTasks());
  }

  loadTasks(): void {
    this.isLoading.set(true);
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks)
        this.isLoading.set(false)
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Could not load tasks')
        this.isLoading.set(false);
      }
    })
  }

  openAddTask(): void {
    const ref = this.modalService.open(TaskFormModal, { centered: true });
    ref.closed.subscribe(() => this.loadTasks())
  }

  openEditTask(task: Task): void {
    const ref = this.modalService.open(TaskFormModal, { centered: true });
    ref.componentInstance.taskToEdit = task;
    ref.closed.subscribe(() => this.loadTasks());
  }

  openTaskDetail(task: Task): void {
    const ref = this.modalService.open(TaskDetailModal, { centered: true, size: 'lg' });
    ref.componentInstance.task = task;
    ref.closed.subscribe((result) => {
      if (result === 'edit') this.openEditTask(task);
    });
  }

  deleteTask(task: Task): void {
    if (!confirm(`Delete "${task.title}"? This connect be undone`)) return;
    this.taskService.deleteTask(task._id).subscribe({
      next: () => this.loadTasks(),
      error: (err) => this.errorMessage.set(err.error?.message || 'Could not delete task'),
    })
  }

  initialsFor(name: string): string {
    return getInitials(name)
  }

  colorFor(name: string): string {
    return getAvatarColor(name)
  }

}
