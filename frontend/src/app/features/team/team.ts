import { Component, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { TaskService } from '../../core/services/task.service';
import { TeamMemberOverview } from '../../core/models/user.model';
import { Task } from '../../core/models/task.model';
import { getAvatarColor, getInitials } from '../../shared/utils/avatar.util';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { RoleBadge } from '../../shared/components/role-badge/role-badge';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-team',
  imports: [DatePipe, RoleBadge, StatusBadge],
  templateUrl: './team.html',
  styleUrl: './team.scss',
})
export class Team implements OnInit{
  private userService = inject(UserService);
  private taskService = inject(TaskService)

  members = signal<TeamMemberOverview[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  expandedId = signal<string | null>(null);
  expandedTasks = signal<Task[]>([]);
  loadingTasks = signal(false);

  ngOnInit(): void {
    this.userService.getTeamOverview().subscribe({
      next: (members) => {
        this.members.set(members);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.error.message || 'Could not load team');
        this.isLoading.set(false);
      }
    })
  }

  toggleExpand(member: TeamMemberOverview): void {
    if (this.expandedId() === member._id){
      this.expandedId.set(null);
      return
    }

    this.expandedId.set(member._id);
    this.loadingTasks.set(true);
    this.taskService.getTasks({assignedTo: member._id}).subscribe({
      next: (tasks) => {
        this.expandedTasks.set(tasks)
        this.loadingTasks.set(false)
      },
      error: () => this.loadingTasks.set(false)
    })
  }

  initialsFor(name: string): string{
    return getInitials(name);
  }

  colorFor(name: string): string {
    return getAvatarColor(name)
  }
}
