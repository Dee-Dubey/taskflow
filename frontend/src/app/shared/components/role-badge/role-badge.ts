import { Component, computed, input } from '@angular/core';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-role-badge',
  imports: [],
  templateUrl: './role-badge.html',
  styleUrl: './role-badge.scss',
})
export class RoleBadge {
  role = input.required<Role>()

  label = computed(()=> {
    switch (this.role()){
      case 'manager': return 'Manager'
      case 'teamlead': return 'Team Lead';
      case 'employee': return 'Employee';
    }
  })

  
  classes = computed(()=> {
    switch (this.role()){
      case 'manager': return 'text-bg-purple-subtle';
      case 'teamlead': return 'text-bg-primary-subtle text-primary-emphasis';
      case 'employee': return 'text-bg-secondary-subtle text-secondary-emphasis';
    }
  })
}
