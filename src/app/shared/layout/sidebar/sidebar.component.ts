import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TokenService } from '../../../core/services/token';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styles: [':host { display: contents; }'],
})
export class SidebarComponent {
  readonly tokenService = inject(TokenService);

  closeOnOverlay(): void {
    document.body.classList.remove('vertical-sidebar-enable');
  }
}
