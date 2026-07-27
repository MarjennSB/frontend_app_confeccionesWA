import { TokenService } from './token';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequestDto, LoginResponseDto } from '../models/auth.model';
import { Observable, tap } from 'rxjs';

import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);

  private readonly authUrl = `${environment.apiUrl}/auth/login`;

    login(credentials: LoginRequestDto): Observable<LoginResponseDto> {
    const body = new HttpParams()
      .set('username', credentials.email || '' ) // FastAPI OAuth2 expects 'username'
      .set('password', credentials.password || '' );

    return this.http.post<LoginResponseDto>(this.authUrl, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap((r) => {
        this.tokenService.saveToken(r.access_token);
        this.tokenService.saveUser(r.user);
        this.sessionService.reset();
      })
    );
  }

  logout(): void {
    this.tokenService.removeToken();
    this.router.navigate(['/auth/login']);
  }
}
