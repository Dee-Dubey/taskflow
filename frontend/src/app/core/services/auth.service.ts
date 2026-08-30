import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environment/environment';
import { LoginPayload, RegisterPayload, ReportsToOption, User } from '../models/user.model';
import { Observable, tap } from 'rxjs';

const ACCESS_TOKEN_KEY = 'taskflow_access_token';
const USER_KEY = 'taskflow_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient)
  private base = environment.apiUrl

  private accessTokenSignal = signal<string | null>(sessionStorage.getItem(ACCESS_TOKEN_KEY));
  private currentUserSignal = signal<User | null>(this.readStoredUser())

  accessToken = this.accessTokenSignal.asReadonly();
  currentUser = this.currentUserSignal.asReadonly();
  isLoggedIn = computed(() => this.accessTokenSignal() !== null)

  private readStoredUser(): User | null {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null
  }

  private setSession(accessToken: string, user: User): void {
    this.accessTokenSignal.set(accessToken)
    this.currentUserSignal.set(user);
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  private clearSession(): void {
    this.accessTokenSignal.set(null);
    this.currentUserSignal.set(null);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  register(payload: RegisterPayload): Observable<{message: string; user: User}>{
    return this.http.post<{message: string; user: User}>(`${this.base}/auth/register`, payload);
  }

  login(payload: LoginPayload): Observable<{accessToken: string; user: User}>{
    return this.http.post<{accessToken: string; user: User}>(`${this.base}/auth/login`, payload, {
      withCredentials: true
    }).pipe(tap((res) => this.setSession(res.accessToken, res.user)))
  }

  refresh(): Observable<{accessToken: string; user: User}>{
    return this.http.post<{accessToken: string; user: User}>(`${this.base}/auth/refresh`, {}, { 
      withCredentials: true 
    }).pipe(tap((res)=> this.setSession(res.accessToken, res.user)))
  }

  logout(): Observable<{message: string}>{
    return this.http.post<{message: string}>(`${this.base}/auth/logout`, {}, { 
      withCredentials: true 
    }).pipe(tap(()=> this.clearSession()))
  }


  getManagers(): Observable<ReportsToOption[]>{
    return this.http.get<ReportsToOption[]>(`${this.base}/auth/managers`);
  }

  getTeamLead(): Observable<ReportsToOption[]>{
    return this.http.get<ReportsToOption[]>(`${this.base}/auth/teamleads`);
  }
}
