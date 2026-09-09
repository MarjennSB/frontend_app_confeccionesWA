import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Service } from '../models/service.model';

export interface ServicePaginatedResponse {
  servicios: {
    data: Service[];
  };
  pagination: {
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

export interface ServiceSingleResponse {
  codigo: number;
  mensaje?: string;
  servicio: Service;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private apiUrl = `${environment.apiUrl}/servicios`;
  private http = inject(HttpClient);

  getServices(page: number = 1, perPage: number = 15, search: string = ''): Observable<ServicePaginatedResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ServicePaginatedResponse>(this.apiUrl, { params });
  }

  getServiceById(id: string): Observable<ServiceSingleResponse> {
    return this.http.get<ServiceSingleResponse>(`${this.apiUrl}/${id}`);
  }

  createService(service: Partial<Service>): Observable<ServiceSingleResponse> {
    return this.http.post<ServiceSingleResponse>(this.apiUrl, service);
  }

  updateService(id: string, service: Partial<Service>): Observable<ServiceSingleResponse> {
    return this.http.put<ServiceSingleResponse>(`${this.apiUrl}/${id}`, service);
  }
}
