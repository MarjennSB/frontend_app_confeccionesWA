import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';
import { TokenService } from '../../../core/services/token.service';

@Component({
  selector: 'app-session-expired-modal',
  standalone: true,
  templateUrl: './session-expired-modal.html',
})
export class SessionExpiredModalComponent {
  private readonly sessionService = inject(SessionService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  readonly sessionExpired = this.sessionService.sessionExpired;

  goToLogin(): void {
    this.sessionService.reset();
    this.tokenService.removeToken();
    this.router.navigate(['/auth/login']);
  }
}
