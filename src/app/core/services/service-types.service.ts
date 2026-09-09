import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ServiceTypes } from '../models/service-types.model';

export interface ServiceTypesResponse {
  data: ServiceTypes[];
}

@Injectable({
  providedIn: 'root'
})
export class ServiceTypesService {
  private apiUrl = `${environment.apiUrl}/service-types`;
  private http = inject(HttpClient);

  getServiceTypes(): Observable<ServiceTypesResponse | ServiceTypes[]> {
    return this.http.get<ServiceTypesResponse | ServiceTypes[]>(this.apiUrl);
  }
}
