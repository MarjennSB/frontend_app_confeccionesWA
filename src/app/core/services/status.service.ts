import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Status } from '../models/status.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StatusService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/status`;

  getAll(): Observable<Status[]> {
    return this.http.get<Status[]>(`${this.baseUrl}/all`);
  }

  getById(id: number): Observable<Status> {
    return this.http.get<Status>(`${this.baseUrl}/${id}`);
  }
}
