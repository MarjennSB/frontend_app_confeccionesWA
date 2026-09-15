import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Production,
  ProductionListResponse,
  CreateProductionDto,
  UpdateProductionDto,
} from '../models/production.model';

@Injectable({ providedIn: 'root' })
export class ProductionsService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/productions`;

  /** GET /api/productions?search=&per_page= */
  getProductions(search: string = '', perPage: number = 10): Observable<ProductionListResponse> {
    const params = new HttpParams()
      .set('search', search)
      .set('per_page', perPage.toString());
    return this.http.get<ProductionListResponse>(this.apiUrl, { params });
  }

  /** POST /api/productions (application/json) */
  createProduction(data: CreateProductionDto): Observable<{ codigo: number; mensaje: string; production: Production }> {
    return this.http.post<{ codigo: number; mensaje: string; production: Production }>(this.apiUrl, data);
  }

  /** PUT /api/productions/{id} (application/json) */
  updateProduction(id: number | string, data: UpdateProductionDto): Observable<{ mensaje: string; production: Production }> {
    return this.http.put<{ mensaje: string; production: Production }>(`${this.apiUrl}/${id}`, data);
  }
}
