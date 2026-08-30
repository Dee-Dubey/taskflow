import { Component, inject } from '@angular/core';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { DatePipe } from '@angular/common';
import { getAvatarColor, getInitials } from '../../../shared/utils/avatar.util';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-detail-modal',
  imports: [DatePipe, StatusBadge],
  templateUrl: './task-detail-modal.html',
  styleUrl: './task-detail-modal.scss',
})
export class TaskDetailModal {
  activeModal = inject(NgbActiveModal);
  task: Task | null = null;

  initialsFor(name: string): string {
    return getInitials(name);
  }
  colorFor(name: string): string {
    return getAvatarColor(name);
  }
}
