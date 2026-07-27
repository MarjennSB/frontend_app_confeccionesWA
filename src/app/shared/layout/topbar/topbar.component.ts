import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { TokenService } from '../../../core/services/token';
import { WebsocketService } from '../../../core/services/websocket.service';
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
  private readonly wsService = inject(WebsocketService);

  readonly currentUser = this.tokenService.currentUser;
  
  hasUnreadAlert = false;
  latestAlert: any = null;
  private wsSubscription?: Subscription;

  ngOnInit() {
    this.wsService.connectGlobal();
    this.wsSubscription = this.wsService.onGlobalMessage().subscribe((msg) => {
      if (msg.type === 'CRITICAL_DEVICE_DOWN') {
        this.hasUnreadAlert = true;
        this.latestAlert = msg;
        this.showToast();
      } else if (msg.type === 'CRITICAL_DEVICE_UP') {
        this.latestAlert = msg;
        this.showToast();
      }
    });
  }

  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
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
      html.setAttribute('data-topbar', 'light');
    } else {
      html.setAttribute('data-bs-theme', 'dark');
      html.setAttribute('data-topbar', 'dark');
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
