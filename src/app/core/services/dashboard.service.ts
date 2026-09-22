import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardData {
  pending_invoicing: number;
  monthly_income: number;
  monthly_production: number;
  
  // Nuevos Totales
  total_guides: number;
  total_invoices: number;
  total_colors: number;
  total_purchase_orders: number;

  // Gráficos y Timeline
  donut_chart: {
    pagadas: number;
    pendientes: number;
  };
  bar_chart: Array<{ date: string; total: number }>;
  income_trend: Array<{ label: number; payment_status: string; total: number }>;
  timeline: Array<{
    type: string;
    title: string;
    description: string;
    created_at: string;
  }>;

  critical_invoices: any[];
  latest_productions: any[];
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  getDashboardData(date?: string): Observable<DashboardResponse> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<DashboardResponse>(this.apiUrl, { params });
  }
}
