import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  MeResponseDto,
} from '../models/auth.model';
import { TokenService } from './token.service';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http           = inject(HttpClient);
  private readonly tokenService   = inject(TokenService);
  private readonly sessionService = inject(SessionService);
  private readonly router         = inject(Router);

  private readonly baseUrl = `${environment.apiUrl}/auth`;

  /** POST /api/auth/login */
  login(credentials: LoginRequestDto): Observable<MeResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.baseUrl}/login`, credentials).pipe(
      switchMap((r) => {
        this.tokenService.saveToken(r.access_token);
        return this.me(); // Ahora trae el usuario (y su rol)
      }),
      tap((meRes) => {
        this.tokenService.saveUser(meRes.usuario);
        this.sessionService.reset();
      })
    );
  }

  /** POST /api/auth/register */
  register(data: RegisterRequestDto): Observable<RegisterResponseDto> {
    return this.http.post<RegisterResponseDto>(`${this.baseUrl}/register`, data).pipe(
      tap((r) => {
        this.tokenService.saveToken(r.access_token);
        this.tokenService.saveUser(r.usuario);
        this.sessionService.reset();
      })
    );
  }

  /** GET /api/auth/me */
  me(): Observable<MeResponseDto> {
    return this.http.get<MeResponseDto>(`${this.baseUrl}/me`);
  }

  /** POST /api/auth/refresh */
  refresh(): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.baseUrl}/refresh`, {}).pipe(
      tap((r) => this.tokenService.saveToken(r.access_token))
    );
  }

  /** POST /api/auth/logout */
  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => {
        this.tokenService.removeToken();
        this.router.navigate(['/auth/login']);
      })
    );
  }

  /** Cierre de sesión local sin llamada al backend */
  logoutLocal(): void {
    this.tokenService.removeToken();
    this.router.navigate(['/auth/login']);
  }
}