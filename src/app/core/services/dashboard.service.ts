import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Certificate } from '../models/certificate.model';

export interface DashboardStats {
  kpis: {
    totalYear: number;
    totalMonth: number;
    totalRequests: number;
    totalLandlords: number;
  };
  byMonth: { label: string; total: number }[];
  byStatus: { label: string; total: number }[];
  recent: Certificate[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/certificates`;

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
  }
}
