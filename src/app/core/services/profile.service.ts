import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MeResponseDto } from '../models/auth.model';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http         = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly baseUrl      = `${environment.apiUrl}/auth`;

  /** GET /api/auth/me — obtiene y sincroniza el usuario en el token service */
  getProfile(): Observable<MeResponseDto> {
    return this.http.get<MeResponseDto>(`${this.baseUrl}/me`).pipe(
      tap((r) => {
        if (r.usuario) {
          this.tokenService.saveUser(r.usuario);
        }
      })
    );
  }
}
