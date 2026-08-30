import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Role, UserOverview } from '../../../core/models/user.model';
import { getAvatarColor, getInitials } from '../../../shared/utils/avatar.util';
import { UserService } from '../../../core/services/user.service';
import { RoleBadge } from '../../../shared/components/role-badge/role-badge';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-list',
  imports: [FormsModule, RoleBadge],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList implements OnInit {
  private userService = inject(UserService);

  users = signal<UserOverview[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  searchTerm = signal('');
  roleFilter = signal<Role | ''>('');

  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const role = this.roleFilter();
    return this.users().filter((u) => {
      const matchesSearch = !term || u.username.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
      const matchesRole = !role || u.role === role;
      return matchesSearch && matchesRole;
    });
  });

  managers = computed(() => this.filtered().filter((u) => u.role === 'manager'));
  teamLeads = computed(() => this.filtered().filter((u) => u.role === 'teamlead'));
  employees = computed(() => this.filtered().filter((u) => u.role === 'employee'));

  ngOnInit(): void {
    this.userService.getUsersOverview().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Could not load users');
        this.isLoading.set(false);
      },
    });
  }


  initialsFor(name: string): string {
    return getInitials(name);
  }


  colorFor(name: string): string {
    return getAvatarColor(name);
  }
}
