import { computed, Injectable, signal } from '@angular/core';
import { CurrentUser } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class TokenService {

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private readonly _token = signal<string | null>(this.getTokenFromStorage());
  private readonly _user = signal<CurrentUser | null>(this.getUserFromStorage());

  readonly isAuthenticated = computed(() => !!this._token());
  readonly currentUser = computed(() => this._user());
  readonly userRoles = computed(() => this._user()?.roles ?? []);

    hasRole(...roles: string[]): boolean {
    const user = this.currentUser();
    if (!user || !user.role_id) return false;
    
    // Mapeo del ID de rol de la base de datos a su nombre
    let userRoleStr = '';
    switch (user.role_id) {
      case 1: userRoleStr = 'Administrador'; break;
      case 2: userRoleStr = 'Usuario'; break;
    }

    return roles.includes(userRoleStr);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this._token.set(token);
  }

  saveUser(user: CurrentUser): void {
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

  private getUserFromStorage(): CurrentUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
