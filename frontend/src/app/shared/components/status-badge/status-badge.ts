import { Component, computed, input } from '@angular/core';
import { TaskStatus } from '../../../core/models/task.model';

@Component({
  selector: 'app-status-badge',
  imports: [],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadge {
  status = input.required<TaskStatus>();

  label = computed(() => {
    switch (this.status()){
      case 'pending': return 'Prnding';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed'
    }
  })

  classes = computed(()=> {
    switch (this.status()) {
      case 'pending': return 'text-bg-warning-subtle text-warning-emphasis';
      case 'in-progress': return 'text-bg-info-subtle text-info-emphasis';
      case 'completed': return 'text-bg-success-subtle text-success-emphasis';
    }
  })


}
