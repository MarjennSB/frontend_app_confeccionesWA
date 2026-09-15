import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Genre } from '../models/genre.model';

export interface GenreListResponse {
  genders: Genre[];
}

@Injectable({ providedIn: 'root' })
export class GenresService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/genders`;

  /** GET /api/genders */
  getGenres(): Observable<GenreListResponse> {
    return this.http.get<GenreListResponse>(this.apiUrl);
  }
}