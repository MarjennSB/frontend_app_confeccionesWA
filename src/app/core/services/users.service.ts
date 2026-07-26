import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/all`);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/register`, dto);
  }

  update(id: string, dto: UpdateUserDto): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/update/${id}`, dto);
  }

  toggleActive(id: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/toggle/${id}`, {});
  }
}
