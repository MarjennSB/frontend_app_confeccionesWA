import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponsibleOfficer, CreateResponsibleOfficerDto, UpdateResponsibleOfficerDto } from '../models/responsible-officer.model';

@Injectable({
  providedIn: 'root',
})
export class ResponsibleOfficerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/responsible-officer`;

  getAll(): Observable<ResponsibleOfficer[]> {
    return this.http.get<ResponsibleOfficer[]>(`${this.baseUrl}/all`);
  }

  getById(id: number): Observable<ResponsibleOfficer> {
    return this.http.get<ResponsibleOfficer>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateResponsibleOfficerDto): Observable<ResponsibleOfficer> {
    return this.http.post<ResponsibleOfficer>(`${this.baseUrl}/register`, dto);
  }

  update(id: number, dto: UpdateResponsibleOfficerDto): Observable<ResponsibleOfficer> {
    return this.http.post<ResponsibleOfficer>(`${this.baseUrl}/update/${id}`, dto);
  }

  remove(id: number): Observable<ResponsibleOfficer> {
    return this.http.delete<ResponsibleOfficer>(`${this.baseUrl}/${id}`);
  }
}
