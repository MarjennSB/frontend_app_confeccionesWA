import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { SessionExpiredModalComponent } from '../components/session-expired-modal/session-expired-modal';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, SessionExpiredModalComponent],
  templateUrl: './layout.html',
})
export class LayoutComponent {}
