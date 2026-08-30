import { Component, inject, input, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { TaskService } from '../../../core/services/task.service';
import { Task, TaskFormPayload, TaskStatus, TaskUserRef } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form-modal.html',
  styleUrl: './task-form-modal.scss',
})
export class TaskFormModal implements OnInit {
  activeModal = inject(NgbActiveModal)
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private taskService = inject(TaskService);

  // taskToEdit = input<Task | null>(null);
  taskToEdit: Task | null = null;

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  assignableUsers = signal<TaskUserRef[]>([]);
  loadingUsers = signal(false);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.maxLength(2000)]],
    // status: this.fb.control<'pending' | 'in-progress' | 'completed'>('pending', Validators.required),
    status: this.fb.control<TaskStatus>('pending', Validators.required),
    dueDate: [''],
    assignedTo: [''],
  })


  get isEmployee(): boolean {
    return this.auth.currentUser()?.role === 'employee';
  }

  get isEditMode(): boolean {
    return this.taskToEdit !== null
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if(!this.isEmployee){
      this.loadingUsers.set(true);
      this.userService.getAssignableUsers().subscribe({
        next: (users) => {
          console.log(users)
          this.assignableUsers.set(users);
          this.loadingUsers.set(false);
        },
        error: () => this.loadingUsers.set(false)
      })
    }

    const task = this.taskToEdit;
    if(task){
      this.form.patchValue({
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
        assignedTo: task.assignedTo._id
      })
    }
  }

  onSubmit(): void {
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const raw = this.form.getRawValue();

    const payload: TaskFormPayload = {
      title: raw.title,
      description: raw.description,
      status: raw.status,
      dueDate: raw.dueDate || null,
      assignedTo: raw.assignedTo || undefined
    }

    const task = this.taskToEdit;

    if(task){
      this.taskService.updateTask(task._id, payload).subscribe({
        next: (updated) =>{
          const assigneeChanged = payload.assignedTo && payload.assignedTo !== task.assignedTo._id;
          if(assigneeChanged && !this.isEmployee){
            this.taskService.reassignTask(task._id, payload.assignedTo!).subscribe({
              next: (final) => this.closeWithResult(final),
              error: (err) => this.handleError(err),
            })
          } else {
            this.closeWithResult(updated);
          }
        },
        error: (err) => this.handleError(err)
      })
    }  else {
      // Create mode
      this.taskService.createTask(payload).subscribe({
        next: (created) => this.closeWithResult(created),
        error: (err) => this.handleError(err),
      });
    }
  }

  private closeWithResult(task: Task): void {
    this.isSubmitting.set(false);
    this.activeModal.close(task)
  }

  private handleError(error: any): void{
    this.isSubmitting.set(false);
    this.errorMessage.set(error.error.message || 'Something went wrong. Please try again.')
  }

}
