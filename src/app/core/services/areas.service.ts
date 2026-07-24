import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Area, CreateAreaDto, UpdateAreaDto } from '../models/area.model';

@Injectable({
  providedIn: 'root',
})
export class AreasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/areas`;

  getAll(): Observable<Area[]> {
    return this.http.get<Area[]>(`${this.baseUrl}/all`);
  }

  getById(id: number): Observable<Area> {
    return this.http.get<Area>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateAreaDto): Observable<Area> {
    return this.http.post<Area>(`${this.baseUrl}/register`, dto);
  }

  update(id: number, dto: UpdateAreaDto): Observable<Area> {
    return this.http.post<Area>(`${this.baseUrl}/update/${id}`, dto);
  }

  remove(id: number): Observable<Area> {
    return this.http.delete<Area>(`${this.baseUrl}/${id}`);
  }
}
