import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Network, CreateNetworkDto, UpdateNetworkDto } from '../models/network.model';
import { PaginatedNetworks } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class NetworksService {
  private apiUrl = `${environment.apiUrl}/networks`;

  constructor(private http: HttpClient) { }

  getNetworks(): Observable<PaginatedNetworks<Network>> {
    return this.http.get<PaginatedNetworks<Network>>(this.apiUrl);
  }

  getNetwork(id: number): Observable<Network> {
    return this.http.get<Network>(`${this.apiUrl}/${id}`);
  }

  createNetwork(data: CreateNetworkDto): Observable<Network> {
    return this.http.post<Network>(this.apiUrl, data);
  }

  updateNetwork(id: number, data: UpdateNetworkDto): Observable<Network> {
    return this.http.patch<Network>(`${this.apiUrl}/${id}`, data);
  }

  deleteNetwork(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  triggerScan(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/scan`, {});
  }

  getNetworkScans(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/scans`);
  }
}
