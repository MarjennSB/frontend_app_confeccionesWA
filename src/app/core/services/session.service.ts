import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly sessionExpired = signal(false);

  triggerExpired(): void {
    this.sessionExpired.set(true);
  }

  reset(): void {
    this.sessionExpired.set(false);
  }
}
