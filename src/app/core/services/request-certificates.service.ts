import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestCertificate, CreateRequestCertificateDto, UpdateRequestCertificateDto } from '../models/request-certificate.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RequestCertificatesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/request-certificates`;

  getAll(): Observable<RequestCertificate[]> {
    return this.http.get<RequestCertificate[]>(`${this.baseUrl}/all`);
  }

  getByLandlord(landlordId: string): Observable<RequestCertificate[]> {
    return this.http.get<RequestCertificate[]>(`${this.baseUrl}/landlord/${landlordId}`);
  }

  getById(id: string): Observable<RequestCertificate> {
    return this.http.get<RequestCertificate>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateRequestCertificateDto): Observable<RequestCertificate> {
    return this.http.post<RequestCertificate>(`${this.baseUrl}/register`, dto);
  }

  update(id: string, dto: UpdateRequestCertificateDto): Observable<RequestCertificate> {
    return this.http.post<RequestCertificate>(`${this.baseUrl}/update/${id}`, dto);
  }

  remove(id: string): Observable<RequestCertificate> {
    return this.http.delete<RequestCertificate>(`${this.baseUrl}/${id}`);
  }
}
