import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Certificate, GenerateCertificateDto } from '../models/certificate.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CertificatesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/certificates`;

  generate(dto: GenerateCertificateDto): Observable<Certificate> {
    return this.http.post<Certificate>(`${this.baseUrl}/generate`, dto);
  }

  getAll(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.baseUrl}/all`);
  }

  getById(id: string): Observable<Certificate> {
    return this.http.get<Certificate>(`${this.baseUrl}/${id}`);
  }
}
