import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Landlord, CreateLandlordDto, UpdateLandlordDto } from '../models/landlord.model';

@Injectable({
  providedIn: 'root',
})
export class LandlordsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/landlords`;

  getAll(): Observable<Landlord[]> {
    return this.http.get<Landlord[]>(`${this.baseUrl}/all`);
  }

  getById(id: string): Observable<Landlord> {
    return this.http.get<Landlord>(`${this.baseUrl}/${id}`);
  }

  getByDocument(document_number: string): Observable<Landlord> {
    return this.http.get<Landlord>(`${this.baseUrl}/document/${document_number}`);
  }

  create(dto: CreateLandlordDto): Observable<Landlord> {
    return this.http.post<Landlord>(`${this.baseUrl}/register`, dto);
  }

  update(id: string, dto: UpdateLandlordDto): Observable<Landlord> {
    return this.http.post<Landlord>(`${this.baseUrl}/update/${id}`, dto);
  }

  remove(id: string): Observable<Landlord> {
    return this.http.delete<Landlord>(`${this.baseUrl}/${id}`);
  }
}
