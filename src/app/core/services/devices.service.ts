import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Device } from '../models/device.model';
import { DeviceInventory } from '../models/device-inventory.model';
import { NetworkDevicesResponse } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {
  private baseApiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getNetworkDevices(networkId: number | null, aliveOnly: boolean = false): Observable<NetworkDevicesResponse<Device>> {
    let url = '';
    if (networkId !== null) {
      url = `${this.baseApiUrl}/networks/${networkId}/devices?alive_only=${aliveOnly}`;
    } else {
      url = `${this.baseApiUrl}/devices?alive_only=${aliveOnly}`;
    }
    return this.http.get<NetworkDevicesResponse<Device>>(url);
  }

  getDevice(id: number): Observable<any> {
    const url = `${this.baseApiUrl}/devices/${id}`;
    return this.http.get<any>(url);
  }

  getDeviceInventory(deviceId: number): Observable<DeviceInventory> {
    const url = `${this.baseApiUrl}/devices/${deviceId}/inventory`;
    return this.http.get<DeviceInventory>(url);
  }

  getDeviceStats(deviceId: number): Observable<any> {
    const url = `${this.baseApiUrl}/devices/${deviceId}/stats`;
    return this.http.get<any>(url);
  }

  setDeviceVip(deviceId: number, isCritical: boolean): Observable<Device> {
    const url = `${this.baseApiUrl}/devices/${deviceId}/vip`;
    return this.http.put<Device>(url, { is_critical: isCritical });
  }
}
