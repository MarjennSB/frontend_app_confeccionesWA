import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto, Role } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth/users`;
  private readonly rolesUrl = `${environment.apiUrl}/auth/roles`;

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/all`);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/register`, dto);
  }

  update(id: string, dto: UpdateUserDto): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/update/${id}`, dto);
  }

  toggleActive(id: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/toggle/${id}`, {});
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.rolesUrl}/all`);
  }
}
