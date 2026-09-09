import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './topbar.component.html',
  styles: [':host { display: contents; }'],
})
export class TopbarComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);

  readonly currentUser = this.tokenService.currentUser;

  hasUnreadAlert = false;
  latestAlert: any = null;
  private wsSubscription?: Subscription;
  private themeObserver?: MutationObserver;

  ngOnInit() {
    this.setupThemeObserver();
  }

  setupThemeObserver(): void {
    const html = document.documentElement;
    
    // Set initial state
    if (html.getAttribute('data-bs-theme') === 'dark') {
      html.setAttribute('data-topbar', 'dark');
    }

    // Observe changes to data-bs-theme by app.js
    this.themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-bs-theme') {
          const currentTheme = html.getAttribute('data-bs-theme');
          if (currentTheme === 'dark') {
            html.setAttribute('data-topbar', 'dark');
          } else {
            html.setAttribute('data-topbar', 'light');
          }
        }
      });
    });

    this.themeObserver.observe(html, { attributes: true, attributeFilter: ['data-bs-theme'] });
  }

  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
  }

  showToast() {
    const toastEl = document.getElementById('vipToast');
    if (toastEl) {
      // @ts-ignore
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }

  clearAlerts() {
    this.hasUnreadAlert = false;
  }

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

  toggleTheme(): void {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-bs-theme');

    if (currentTheme === 'dark') {
      html.setAttribute('data-bs-theme', 'light');
      sessionStorage.setItem('data-layout-mode', 'light');
    } else {
      html.setAttribute('data-bs-theme', 'dark');
      sessionStorage.setItem('data-layout-mode', 'dark');
    }
  }

  logout(): void {
    this.authService.logout();
  }
}

