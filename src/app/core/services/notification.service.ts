import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Notification } from '../models/notification.model';

export interface NotificationPaginatedResponse {
  notificaciones: {
    data: Notification[];
  };
  pagination: {
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

export interface NotificationSingleResponse {
  codigo: number;
  mensaje?: string;
  notificacion: Notification;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notificaciones`;
  private http = inject(HttpClient);

  getNotifications(page: number = 1, perPage: number = 15, search: string = ''): Observable<NotificationPaginatedResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<NotificationPaginatedResponse>(this.apiUrl, { params });
  }

  getNotificationById(id: string): Observable<NotificationSingleResponse> {
    return this.http.get<NotificationSingleResponse>(`${this.apiUrl}/${id}`);
  }

  createNotification(notification: Partial<Notification>): Observable<NotificationSingleResponse> {
    return this.http.post<NotificationSingleResponse>(this.apiUrl, notification);
  }

  updateNotification(id: string, notification: Partial<Notification>): Observable<NotificationSingleResponse> {
    return this.http.put<NotificationSingleResponse>(`${this.apiUrl}/${id}`, notification);
  }
}
