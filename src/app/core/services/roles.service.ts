import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, RoleListResponse, CreateRoleDto, UpdateRoleDto } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/roles`;

  /** GET /api/roles?search= */
  getRoles(search: string = ''): Observable<RoleListResponse> {
    const params = new HttpParams().set('search', search);
    return this.http.get<RoleListResponse>(this.apiUrl, { params });
  }

  /** GET /api/roles/{id} */
  getRole(id: number | string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  /** POST /api/roles */
  createRole(data: CreateRoleDto): Observable<{ mensaje: string; message: number }> {
    return this.http.post<{ mensaje: string; message: number }>(this.apiUrl, data);
  }

  /** PUT /api/roles/{id} */
  updateRole(id: number | string, data: UpdateRoleDto): Observable<{ mensaje: string; message: number }> {
    return this.http.put<{ mensaje: string; message: number }>(`${this.apiUrl}/${id}`, data);
  }
}