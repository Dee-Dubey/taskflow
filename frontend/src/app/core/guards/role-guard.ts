import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';
import { inject } from '@angular/core';

export const roleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService)
    const router = inject(Router)
    const role = auth.currentUser()?.role;
    if(role && allowedRoles.includes(role)) return true
    router.navigate(['/dashboard']);
    return false;
  }
};
