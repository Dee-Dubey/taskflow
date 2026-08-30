import { Component, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ValidationError } from '@angular/forms/signals';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ReportsToOption, Role } from '../../../core/models/user.model';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true}
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(NonNullableFormBuilder)
  private authService = inject(AuthService)
  private router = inject(Router)
  
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null)
  reportsToOptions = signal<ReportsToOption[]>([]);
  loadingOptions = signal(false);

  roles: {value: Role; label: string; description: string}[] = [
    {value: 'manager', label: 'Manager', description: 'Full access — manage all tasks and users'},
    { value: 'teamlead', label: 'Team Lead', description: 'Manage your team and assign tasks' },
    { value: 'employee', label: 'Employee', description: 'View and complete assigned tasks' }
  ]

  form = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_.]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: this.fb.control<Role>('employee', Validators.required),
      reportsTo: ['']
    },
    {validators: passwordsMatchValidator}
  )

  constructor(){
    this.form.controls.role.valueChanges.subscribe((role) => this.onRoleChange(role))
    this.onRoleChange(this.form.controls.role.value);
  }

  private onRoleChange(role: Role):void {
    const reportsToControl = this.form.controls.reportsTo;
    reportsToControl.setValue('')
    this.reportsToOptions.set([])

    if(role === 'manager'){
      reportsToControl.clearValidators();
      reportsToControl.updateValueAndValidity();
      return
    }

    reportsToControl.setValidators([Validators.required]);
    reportsToControl.updateValueAndValidity();

    this.loadingOptions.set(true);
    const request$ = role === 'teamlead' ? this.authService.getManagers() : this.authService.getTeamLead();

    request$.subscribe({
      next: (options) => {
        this.reportsToOptions.set(options);
        console.log(this.reportsToOptions())
        this.loadingOptions.set(false);
      },
      error: ()=> {
        this.errorMessage.set('Could not load options, please refresh and try again.');
        this.loadingOptions.set(false)
      }
    })
  }

  get reportsToLabel(): string {
    return this.form.controls.role.value === 'teamlead' ? 'Select your Manager' :  'Select your Team Lead';
  }

  onSubmit(): void {
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const {confirmPassword, reportsTo, ...rest} = this.form.getRawValue();
    const payload = rest.role === 'manager' ? rest: {...rest, reportsTo};

    this.authService.register(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error.error?.message || 'Registration failed. Please try again.');
      }
    })
  }
}
