import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../core/services/token.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  templateUrl: './unauthorized.html',
})
export class UnauthorizedComponent {
  private tokenService = inject(TokenService);
  private router = inject(Router);

  goToLogin() {
    this.tokenService.removeToken();
    this.router.navigate(['/auth/login']);
  }
}
