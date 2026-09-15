import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Color,
  ColorListResponse,
  CreateColorDto,
  UpdateColorDto,
} from '../models/color.model';

@Injectable({ providedIn: 'root' })
export class ColorsService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/colores`;

  /** GET /api/colores?search=&per_page= */
  getColors(search: string = '', perPage: number = 10): Observable<ColorListResponse> {
    const params = new HttpParams()
      .set('search', search)
      .set('per_page', perPage.toString());
    return this.http.get<ColorListResponse>(this.apiUrl, { params });
  }

  /** POST /api/colores (application/json) */
  createColor(data: CreateColorDto): Observable<{ codigo: number; mensaje: string; color: Color }> {
    return this.http.post<{ codigo: number; mensaje: string; color: Color }>(this.apiUrl, data);
  }

  /** PUT /api/colores/{id} (application/json) */
  updateColor(id: number | string, data: UpdateColorDto): Observable<{ mensaje: string; color: Color }> {
    return this.http.put<{ mensaje: string; color: Color }>(`${this.apiUrl}/${id}`, data);
  }
}
