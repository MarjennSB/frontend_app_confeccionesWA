import { computed, Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly TOKEN_KEY = 'cwa_auth_token';
  private readonly USER_KEY  = 'cwa_auth_user';

  private readonly _token = signal<string | null>(this.getTokenFromStorage());
  private readonly _user  = signal<User | null>(this.getUserFromStorage());

  readonly isAuthenticated = computed(() => !!this._token());
  readonly currentUser     = computed(() => this._user());
  readonly userRole        = computed(() => this._user()?.rol_nombre ?? null);

  /** Verifica si el usuario tiene alguno de los roles indicados */
  hasRole(...roles: string[]): boolean {
    const role = this.userRole();
    if (!role) return false;
    return roles.includes(role);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this._token.set(token);
  }

  saveUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  getToken(): string | null {
    return this._token();
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._token.set(null);
    this._user.set(null);
  }

  private getTokenFromStorage(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getUserFromStorage(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
