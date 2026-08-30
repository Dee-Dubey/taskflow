import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { SocketService } from '../../../core/services/socket.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(NonNullableFormBuilder);
  private socketService = inject(SocketService);
  private authService = inject(AuthService);
  private router = inject(Router);

   isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void{
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: ()=> {
        this.isSubmitting.set(false);
        this.socketService.connect()
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: (error) => {
        this.isSubmitting.set(false)
        this.errorMessage.set(error.error?.message || 'Login failed. Please try again.');
      }
    })
  }
}
