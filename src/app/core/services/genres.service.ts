import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Genre } from '../models/genre.model';

@Injectable({
  providedIn: 'root'
})
export class GenresService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/genres`;

  getGenres(): Observable<{ data: Genre[] }> {
    return this.http.get<{ data: Genre[] }>(this.apiUrl);
  }
}