import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { Observable } from 'rxjs';
import { TaskUserRef } from '../models/task.model';
import { TeamMemberOverview, UserOverview } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getAssignableUsers(): Observable<TaskUserRef[]>{
    return this.http.get<TaskUserRef[]>(`${this.base}/users/assignable`)
  }

  getTeamOverview(): Observable<TeamMemberOverview[]>{
    return this.http.get<TeamMemberOverview[]>(`${this.base}/users/team-overview`);
  }

  getUsersOverview(): Observable<UserOverview[]>{
    return this.http.get<UserOverview[]>(`${this.base}/users/overview`);
  }
}
