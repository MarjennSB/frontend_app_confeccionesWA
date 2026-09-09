import { Component, inject, OnInit, signal } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';
import { NotificationModalComponent } from '../components/notification-modal/notification-modal';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [NotificationModalComponent, FormsModule, DatePipe],
  templateUrl: './notification-list.html',
})
export class NotificationListComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  readonly notifications = signal<Notification[]>([]);
  readonly isModalOpen = signal(false);
  readonly selectedNotification = signal<Notification | null>(null);
  
  // Pagination and Search
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly searchQuery = signal('');
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadNotifications();

    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadNotifications();
    });
  }

  loadNotifications(): void {
    this.notificationService.getNotifications(this.currentPage(), 15, this.searchQuery()).subscribe({
      next: (res) => {
        this.notifications.set(res.notificaciones.data);
        this.totalPages.set(res.pagination.last_page);
      },
      error: (err) => console.error('Error cargando notificaciones', err)
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadNotifications();
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadNotifications();
    }
  }

  openModal(notification?: Notification): void {
    this.selectedNotification.set(notification || null);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedNotification.set(null);
  }
}
