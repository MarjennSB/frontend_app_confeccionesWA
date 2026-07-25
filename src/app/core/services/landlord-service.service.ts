import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LandlordService, CreateLandlordServiceDto, UpdateLandlordServiceDto } from '../models/landlord-service.model';

@Injectable({ providedIn: 'root' })
export class LandlordServiceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/landlord-service`;

  getAll(): Observable<LandlordService[]> {
    return this.http.get<LandlordService[]>(`${this.baseUrl}/all`);
  }

  getByLandlord(landlordId: string): Observable<LandlordService[]> {
    return this.http.get<LandlordService[]>(`${this.baseUrl}/landlord/${landlordId}`);
  }

  getById(id: string): Observable<LandlordService> {
    return this.http.get<LandlordService>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateLandlordServiceDto): Observable<LandlordService> {
    return this.http.post<LandlordService>(`${this.baseUrl}/register`, dto);
  }

  update(id: string, dto: UpdateLandlordServiceDto): Observable<LandlordService> {
    return this.http.post<LandlordService>(`${this.baseUrl}/update/${id}`, dto);
  }

  remove(id: string): Observable<LandlordService> {
    return this.http.delete<LandlordService>(`${this.baseUrl}/${id}`);
  }
}
