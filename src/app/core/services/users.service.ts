import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserListResponse } from '../models/user.model';
import { CreateUserDto, UpdateUserDto } from '../models/user.dto';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  /** GET /api/usuarios?search=&per_page= */
  getUsers(search: string = '', page: number = 1, perPage: number = 10): Observable<UserListResponse> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    return this.http.get<UserListResponse>(this.apiUrl, { params });
  }

  /** POST /api/usuarios  (multipart/form-data si lleva imagen) */
  createUser(data: CreateUserDto): Observable<{ codigo: number; mensaje: string; usuario: User }> {
    const formData = this.buildFormData(data);
    return this.http.post<{ codigo: number; mensaje: string; usuario: User }>(this.apiUrl, formData);
  }

  /** PUT /api/usuarios/{id} (multipart/form-data si lleva imagen) */
  updateUser(id: number | string, data: UpdateUserDto): Observable<{ mensaje: string; usuario: User }> {
    const formData = this.buildFormData(data);
    formData.append('_method', 'PUT');
    return this.http.post<{ mensaje: string; usuario: User }>(`${this.apiUrl}/${id}`, formData);
  }

  // ─── Helper ───────────────────────────────────────────────
  private buildFormData(data: CreateUserDto | UpdateUserDto): FormData {
    const fd = new FormData();
    (Object.keys(data) as (keyof typeof data)[]).forEach((key) => {
      const val = data[key];
      if (val === null || val === undefined) return;
      if (key === 'image_url' && val instanceof File) {
        fd.append('image_url', val, val.name);
      } else {
        fd.append(key, String(val));
      }
    });
    return fd;
  }
}