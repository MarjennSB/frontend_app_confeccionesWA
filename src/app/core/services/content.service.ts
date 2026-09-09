import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Content } from '../models/content.model';

export interface ContentPaginatedResponse {
  contenidos: {
    data: Content[];
  };
  pagination: {
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

export interface ContentSingleResponse {
  codigo: number;
  mensaje?: string;
  contenido: Content;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private apiUrl = `${environment.apiUrl}/contenidos`;
  private http = inject(HttpClient);

  getContents(page: number = 1, perPage: number = 15, search: string = ''): Observable<ContentPaginatedResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ContentPaginatedResponse>(this.apiUrl, { params });
  }

  getContentById(id: string): Observable<ContentSingleResponse> {
    return this.http.get<ContentSingleResponse>(`${this.apiUrl}/${id}`);
  }

  createContent(content: Partial<Content>): Observable<ContentSingleResponse> {
    return this.http.post<ContentSingleResponse>(this.apiUrl, content);
  }

  updateContent(id: string, content: Partial<Content>): Observable<ContentSingleResponse> {
    return this.http.put<ContentSingleResponse>(`${this.apiUrl}/${id}`, content);
  }
}
