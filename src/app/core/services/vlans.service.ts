import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vlan, CreateVlanDto, UpdateVlanDto } from '../models/vlan.model';
import { PaginatedNetworks } from '../models/common.model'; // You might need a PaginatedVlans model if you implement pagination for VLANs later.

@Injectable({
  providedIn: 'root'
})
export class VlansService {
  private apiUrl = `${environment.apiUrl}/vlans`;

  constructor(private http: HttpClient) { }

  getVlans(): Observable<{ data: Vlan[] }> {
    return this.http.get<{ data: Vlan[] }>(this.apiUrl);
  }

  createVlan(data: CreateVlanDto): Observable<Vlan> {
    return this.http.post<Vlan>(this.apiUrl, data);
  }

  updateVlan(id: number, data: UpdateVlanDto): Observable<Vlan> {
    return this.http.put<Vlan>(`${this.apiUrl}/${id}`, data);
  }

  deleteVlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
