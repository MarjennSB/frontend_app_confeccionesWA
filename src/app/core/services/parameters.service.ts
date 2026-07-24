import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Parameters, CreateParametersDto, UpdateParametersDto } from '../models/parameters.model';

@Injectable({
  providedIn: 'root',
})
export class ParametersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/parameters`;

  getAll(): Observable<Parameters[]> {
    return this.http.get<Parameters[]>(`${this.baseUrl}/all`);
  }

  getActive(): Observable<Parameters> {
    return this.http.get<Parameters>(`${this.baseUrl}/active`);
  }

  getById(id: number): Observable<Parameters> {
    return this.http.get<Parameters>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateParametersDto): Observable<Parameters> {
    return this.http.post<Parameters>(`${this.baseUrl}/register`, dto);
  }

  update(id: number, dto: UpdateParametersDto): Observable<Parameters> {
    return this.http.post<Parameters>(`${this.baseUrl}/update/${id}`, dto);
  }
}
