import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styles: [':host { display: contents; }'],
})
export class SidebarComponent {

  closeOnOverlay(): void {
    document.body.classList.remove('vertical-sidebar-enable');
  }
}
