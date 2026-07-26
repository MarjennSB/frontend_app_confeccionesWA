import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Certificate, GenerateCertificateDto } from '../models/certificate.model';
import { environment } from '../../../environments/environment';

export interface CertificateFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface CertificatePage {
  data: Certificate[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class CertificatesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/certificates`;

  generate(dto: GenerateCertificateDto): Observable<Certificate> {
    return this.http.post<Certificate>(`${this.baseUrl}/generate`, dto);
  }

  getAll(filters?: CertificateFilters): Observable<CertificatePage> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters?.page) params = params.set('page', String(filters.page));
    if (filters?.limit) params = params.set('limit', String(filters.limit));
    return this.http.get<CertificatePage>(`${this.baseUrl}/all`, { params });
  }

  getById(id: string): Observable<Certificate> {
    return this.http.get<Certificate>(`${this.baseUrl}/${id}`);
  }

  exportExcel(filters?: Pick<CertificateFilters, 'search' | 'dateFrom' | 'dateTo'>): Observable<Blob> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    return this.http.get(`${this.baseUrl}/export`, { params, responseType: 'blob' });
  }

  downloadWord(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download`, { responseType: 'blob' });
  }
}
