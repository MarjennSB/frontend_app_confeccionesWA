import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { CreateUserDto, UpdateUserDto } from '../models/user.dto';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  getUsers(): Observable<{ data: User[] }> {
    return this.http.get<{ data: User[] }>(this.apiUrl);
  }

  getUser(id: string): Observable<{ data: User }> {
    return this.http.get<{ data: User }>(`${this.apiUrl}/${id}`);
  }

  createUser(data: CreateUserDto): Observable<{ data: User, message?: string }> {
    return this.http.post<{ data: User, message?: string }>(this.apiUrl, data);
  }

  updateUser(id: string, data: UpdateUserDto): Observable<{ data: User, message?: string }> {
    return this.http.put<{ data: User, message?: string }>(`${this.apiUrl}/${id}`, data);
  }

  deleteUser(id: string): Observable<{ data: User, message?: string }> {
    return this.http.delete<{ data: User, message?: string }>(`${this.apiUrl}/${id}`);
  }
}