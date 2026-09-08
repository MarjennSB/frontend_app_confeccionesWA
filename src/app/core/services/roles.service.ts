import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/roles`;

  getRoles(): Observable<{ data: Role[] }> {
    return this.http.get<{ data: Role[] }>(this.apiUrl);
  }

  getRole(id: string): Observable<{ data: Role }> {
    return this.http.get<{ data: Role }>(`${this.apiUrl}/${id}`);
  }

  createRole(data: { name: string }): Observable<{ data: Role, message?: string }> {
    return this.http.post<{ data: Role, message?: string }>(this.apiUrl, data);
  }

  updateRole(id: string, data: { name: string }): Observable<{ data: Role, message?: string }> {
    return this.http.put<{ data: Role, message?: string }>(`${this.apiUrl}/${id}`, data);
  }
}