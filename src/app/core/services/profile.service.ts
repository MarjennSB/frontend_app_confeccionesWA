import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProfileData {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  roles: string[];
  created_at: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  getProfile(): Observable<ProfileData> {
    return this.http.get<ProfileData>(`${this.baseUrl}/profile`);
  }

  changePassword(dto: ChangePasswordDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/change-password`, dto);
  }
}
