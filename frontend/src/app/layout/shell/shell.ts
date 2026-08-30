import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { getAvatarColor, getInitials } from '../../shared/utils/avatar.util';
import { RoleBadge } from '../../shared/components/role-badge/role-badge';
import { SocketService } from '../../core/services/socket.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, RoleBadge],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  auth = inject(AuthService);
  private socketService = inject(SocketService);
  private router = inject(Router);

  sidebarOpen = signal(false);

  constructor(){
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.sidebarOpen.set(false)
    })
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false)
  }

  get initials(): string {
    return getInitials(this.auth.currentUser()?.username ?? '');
  }

  get avatarColor(): string{
    return getAvatarColor(this.auth.currentUser()?.username ?? '');
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.socketService.disconnect()
        this.router.navigate(['/login'])
      },
      error: () => {
        this.socketService.disconnect();
        this.router.navigate(['/login'])
      }
    })
  }
}
