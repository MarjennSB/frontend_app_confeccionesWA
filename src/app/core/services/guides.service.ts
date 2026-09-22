import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Guide,
  GuideListResponse,
  CreateGuideDto,
  UpdateGuideDto,
} from '../models/guide.model';

@Injectable({ providedIn: 'root' })
export class GuidesService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/guides`;

  /** GET /api/guides?search=&per_page=&available=&issue_date= */
  getGuides(search: string = '', page: number = 1, perPage: number = 10, available?: boolean, issueDate?: string): Observable<GuideListResponse> {
    let params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    if (available !== undefined) {
      params = params.set('available', available ? '1' : '0');
    }
    if (issueDate) {
      params = params.set('issue_date', issueDate);
    }
    return this.http.get<GuideListResponse>(this.apiUrl, { params });
  }

  /** POST /api/guides (multipart/form-data — archivo obligatorio) */
  createGuide(data: CreateGuideDto): Observable<{ codigo: number; mensaje: string; guide: Guide }> {
    return this.http.post<{ codigo: number; mensaje: string; guide: Guide }>(
      this.apiUrl,
      this.buildFormData(data)
    );
  }

  /** PUT /api/guides/{id} (multipart via POST + _method=PUT — archivo opcional) */
  updateGuide(id: number | string, data: UpdateGuideDto): Observable<{ mensaje: string; guide: Guide }> {
    const fd = this.buildFormData(data);
    fd.append('_method', 'PUT');
    return this.http.post<{ mensaje: string; guide: Guide }>(`${this.apiUrl}/${id}`, fd);
  }

  // ─── Helper ───────────────────────────────────────────────
  private buildFormData(data: CreateGuideDto | UpdateGuideDto): FormData {
    const fd = new FormData();
    (Object.keys(data) as (keyof typeof data)[]).forEach((key) => {
      const val = data[key];
      if (val === null || val === undefined) return;
      if (key === 'attached_file' && val instanceof File) {
        fd.append('attached_file', val, val.name);
      } else if ((key as string) !== '_method') {
        fd.append(key, String(val));
      }
    });
    return fd;
  }
}
