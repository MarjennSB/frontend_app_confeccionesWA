import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DevicesService } from '../../core/services/devices.service';
import { NetworksService } from '../../core/services/networks.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { Device } from '../../core/models/device.model';
import { Network } from '../../core/models/network.model';
import { Subscription } from 'rxjs';

declare const bootstrap: any;

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devices.html',
  styleUrls: ['./devices.css']
})
export class Devices implements OnInit, OnDestroy {
  private devicesService = inject(DevicesService);
  private networksService = inject(NetworksService);
  private wsService = inject(WebsocketService);

  networks: Network[] = [];
  selectedNetworkId: number | null = null;
  
  devices = signal<Device[]>([]);
  isLoading = true;
  isSyncing = false;
  totalItems = 0;
  
  private wsSubscription?: Subscription;

  searchTerm = signal('');

  filteredDevices = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const currentDevices = this.devices();
    if (!term) return currentDevices;
    
    return currentDevices.filter(device => 
      device.ip.toLowerCase().includes(term) ||
      (device.mac_address && device.mac_address.toLowerCase().includes(term)) ||
      (device.hostname && device.hostname.toLowerCase().includes(term))
    );
  });

  ngOnInit() {
    this.loadNetworks();
    this.setupWebSocket();
  }

  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  setupWebSocket() {
    this.wsSubscription = this.wsService.onMessage().subscribe((msg: any) => {
      if (msg.type === 'inventory_sync_complete') {
        alert('¡Sincronización Completada!\n' + (msg.data.message || 'Inventario actualizado desde Google Sheets.'));
        this.loadDevices(); // Recargar la tabla
      }
    });
  }

  loadNetworks() {
    this.isLoading = true;
    this.networksService.getNetworks().subscribe({
      next: (res) => {
        this.networks = res.data;
        // Se puede seleccionar 'null' para ver todas por defecto
        this.selectedNetworkId = null; 
        this.loadDevices();
      },
      error: (err) => {
        console.error('Error loading networks', err);
        this.isLoading = false;
      }
    });
  }

  onNetworkChange() {
    this.loadDevices();
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
  }

  onSyncSheets() {
    this.isSyncing = true;
    this.devicesService.syncInventoryFromSheets().subscribe({
      next: (res) => {
        this.isSyncing = false;
        // La tabla se recargará automáticamente por el WebSocket, 
        // pero por si acaso, lanzamos la notificación.
        alert('¡Éxito!\n' + res.message);
        this.loadDevices();
      },
      error: (err) => {
        this.isSyncing = false;
        console.error('Error al sincronizar Google Sheets', err);
        alert('Error\nNo se pudo sincronizar el inventario.');
      }
    });
  }

  selectedDevice: any = null;
  isDeviceLoading = false;

  loadDevices() {
    this.isLoading = true;
    this.devicesService.getNetworkDevices(this.selectedNetworkId).subscribe({
      next: (res) => {
        this.devices.set(res.devices);
        this.totalItems = res.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading devices', err);
        this.isLoading = false;
      }
    });
  }

  viewDevice(deviceId: number) {
    this.isDeviceLoading = true;
    
    // Abrir el offcanvas vacio/cargando
    const offcanvasEl = document.getElementById('deviceOffcanvas');
    if (offcanvasEl) {
      // @ts-ignore
      const bsOffcanvas = new bootstrap.Offcanvas(offcanvasEl);
      bsOffcanvas.show();
    }

    this.devicesService.getDevice(deviceId).subscribe({
      next: (res) => {
        this.selectedDevice = res;
        this.isDeviceLoading = false;
      },
      error: (err) => {
        console.error('Error fetching device details', err);
        this.isDeviceLoading = false;
      }
    });
  }

  get openPorts() {
    if (!this.selectedDevice || !this.selectedDevice.ports) return [];
    return this.selectedDevice.ports.filter((p: any) => p.state === 'open');
  }

  getServiceName(port: number): string {
    const knownPorts: { [key: number]: string } = {
      21: 'FTP',
      22: 'SSH',
      23: 'Telnet',
      25: 'SMTP',
      53: 'DNS',
      80: 'HTTP',
      110: 'POP3',
      143: 'IMAP',
      443: 'HTTPS',
      445: 'SMB',
      3306: 'MySQL',
      3389: 'RDP',
      5432: 'PostgreSQL',
      8080: 'HTTP-Alt',
      8443: 'HTTPS-Alt'
    };
    return knownPorts[port] || 'TCP';
  }

  toggleVipStatus(device: Device, event: any) {
    const isCritical = event.target.checked;
    this.devicesService.setDeviceVip(device.id, isCritical).subscribe({
      next: (updatedDevice) => {
        // Update device in the local list
        this.devices.update(devices => 
          devices.map(d => d.id === updatedDevice.id ? { ...d, is_critical: updatedDevice.is_critical } : d)
        );
        // Also update selectedDevice if it's currently selected
        if (this.selectedDevice && this.selectedDevice.id === updatedDevice.id) {
          this.selectedDevice.is_critical = updatedDevice.is_critical;
        }
      },
      error: (err) => {
        console.error('Error toggling VIP status', err);
        // Revert the checkbox on error
        event.target.checked = !isCritical;
      }
    });
  }
}
