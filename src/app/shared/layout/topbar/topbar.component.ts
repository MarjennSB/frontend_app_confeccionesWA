import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth';
import { TokenService } from '../../../core/services/token';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);

  readonly currentUser = this.tokenService.currentUser;

  toggleSidebar(): void {
    const windowWidth = window.innerWidth;
    const html = document.documentElement;
    const body = document.body;
    const hamburger = document.querySelector('.hamburger-icon');

    if (windowWidth > 767) {
      const currentSize = html.getAttribute('data-sidebar-size');
      html.setAttribute('data-sidebar-size', currentSize === 'sm' ? 'lg' : 'sm');
    } else {
      body.classList.toggle('vertical-sidebar-enable');
      html.setAttribute('data-sidebar-size', 'lg');
    }

    if (hamburger) {
      hamburger.classList.toggle('open');
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
