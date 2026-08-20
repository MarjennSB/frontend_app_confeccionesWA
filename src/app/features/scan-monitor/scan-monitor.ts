import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NetworksService } from '../../core/services/networks.service';
import { DevicesService } from '../../core/services/devices.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { Network } from '../../core/models/network.model';
import { Device } from '../../core/models/device.model';
import { Subscription } from 'rxjs';

interface GridBox {
  id: number;
  address: string;
  status: 'free' | 'alive' | 'down';
  statusLabel: string;
  user: string;
  openPorts?: string;
}

@Component({
  selector: 'app-scan-monitor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scan-monitor.html',
  styleUrls: ['./scan-monitor.css']
})
export class ScanMonitorComponent implements OnInit, OnDestroy {
  private networksService = inject(NetworksService);
  private devicesService = inject(DevicesService);
  private wsService = inject(WebsocketService);

  networks: Network[] = [];
  selectedNetwork: Network | null = null;
  selectedNetworkId: number | null = null;
  
  gridIps: GridBox[] = [];
  isScanning = false;
  
  // Status info from WS
  scannerMode = '';
  lastScanAt: Date | null = null;
  nextScanAt: Date | null = null;
  countdownStr = '';
  
  private wsSubscription?: Subscription;
  private countdownTimer: any;

  get onlineCount(): number {
    return this.gridIps.filter(ip => ip.status === 'alive').length;
  }

  get downCount(): number {
    return this.gridIps.filter(ip => ip.status === 'down').length;
  }

  get freeCount(): number {
    return this.gridIps.filter(ip => ip.status === 'free').length;
  }

  get usagePercentage(): number {
    if (this.gridIps.length === 0) return 0;
    const used = this.onlineCount + this.downCount;
    return Math.round((used / this.gridIps.length) * 100);
  }

  copyToastMessage: string | null = null;

  copyToClipboard(ipAddress: string) {
    if (!ipAddress) return;
    navigator.clipboard.writeText(ipAddress).then(() => {
      this.copyToastMessage = `IP ${ipAddress} copiada!`;
      setTimeout(() => this.copyToastMessage = null, 3000);
    }).catch(err => {
      console.error('Error al copiar IP: ', err);
    });
  }

  ngOnInit() {
    this.loadNetworks();

    // Escuchar actualizaciones en tiempo real del WebSocket
    this.wsSubscription = this.wsService.onMessage().subscribe((msg) => {
      if (msg.type === 'scan_update' && msg.devices) {
        console.log('[ScanMonitor] Recibido update por WS', msg.devices.length, 'dispositivos');
        this.mergeDevicesIntoGrid(msg.devices);
        this.isScanning = false;
      } else if (msg.type === 'host_discovered') {
        console.log('[ScanMonitor] host_discovered:', msg);
        const idx = this.gridIps.findIndex(g => g.address === msg['ip']);
        if (idx !== -1) {
          if (msg['is_alive']) {
             this.gridIps[idx].status = 'alive';
          } else {
             // Si la caja ya tenía un dispositivo asignado pero no respondió al ping,
             // la marcamos como caída. Si estaba "free", se mantiene "free".
             if (this.gridIps[idx].status === 'alive' || this.gridIps[idx].status === 'down') {
                this.gridIps[idx].status = 'down';
             }
          }
        }
      } else if (msg.type === 'status_update') {
        this.scannerMode = msg.mode || '';
        this.isScanning = !!msg.is_scanning;
        this.lastScanAt = msg.last_scan_at ? new Date(msg.last_scan_at) : null;
        this.nextScanAt = msg.next_scan_at ? new Date(msg.next_scan_at) : null;
      }
    });

    // Iniciar temporizador
    this.countdownTimer = setInterval(() => this.updateCountdown(), 1000);
  }

  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    this.wsService.disconnect();
  }

  private updateCountdown() {
    if (!this.nextScanAt || this.isScanning) {
      this.countdownStr = '';
      return;
    }
    const now = new Date().getTime();
    const target = this.nextScanAt.getTime();
    const diff = target - now;

    if (diff <= 0) {
      this.countdownStr = '00:00';
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      this.countdownStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  loadNetworks() {
    this.networksService.getNetworks().subscribe({
      next: (res) => {
        this.networks = res.data;
        if (this.networks.length > 0) {
          this.selectedNetworkId = this.networks[0].id;
          this.onNetworkChange();
        }
      },
      error: (err) => console.error('Error cargando redes', err)
    });
  }

  onNetworkChange() {
    if (!this.selectedNetworkId || this.selectedNetworkId.toString() === 'null') return;
    
    this.selectedNetwork = this.networks.find(n => n.id == this.selectedNetworkId) || null;
    this.generateBaseGrid();
    
    // Cargar los datos iniciales por HTTP
    this.loadRealDevices();

    // Conectar al WebSocket de esta red (esto disparará el modo ACTIVE en backend)
    this.wsService.connect(this.selectedNetworkId);
  }

  ipToLong(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  }

  longToIp(long: number): string {
    return [
      (long >>> 24) & 255,
      (long >>> 16) & 255,
      (long >>> 8) & 255,
      long & 255
    ].join('.');
  }

  // Genera las IPs vacías dinámicamente basadas en la máscara CIDR (ej. /26 = 62 hosts)
  generateBaseGrid() {
    this.gridIps = [];
    if (!this.selectedNetwork) return;

    const parts = this.selectedNetwork.cidr.split('/');
    const ipStr = parts[0];
    const prefix = parseInt(parts[1], 10) || 24;

    const ipLong = this.ipToLong(ipStr);
    const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
    
    const networkLong = (ipLong & mask) >>> 0;
    const broadcastLong = (networkLong | ~mask) >>> 0;

    // IPs usables excluyen la de red y el broadcast
    const startIp = networkLong + 1;
    const endIp = broadcastLong - 1;

    for (let i = startIp; i <= endIp; i++) {
      const address = this.longToIp(i);
      // Extraemos el último octeto de la IP para mostrarlo bonito en la caja (id visual)
      const lastOctet = parseInt(address.split('.').pop() || '0', 10);
      
      this.gridIps.push({
        id: lastOctet,
        address: address,
        status: 'free',
        statusLabel: 'Libre (No vista)',
        user: 'Desconocido'
      });
    }
  }

  loadRealDevices() {
    if (!this.selectedNetworkId) return;
    
    this.devicesService.getNetworkDevices(this.selectedNetworkId).subscribe({
      next: (res) => {
        this.mergeDevicesIntoGrid(res.devices);
      },
      error: (err) => console.error('Error cargando dispositivos', err)
    });
  }

  mergeDevicesIntoGrid(devices: Device[]) {
    // Reset status but keep the IPs
    this.gridIps.forEach(box => {
      box.status = 'free';
      box.statusLabel = 'Libre (No vista)';
      box.user = 'Desconocido';
    });

    // Map real devices
    devices.forEach(device => {
      // Buscar directamente por dirección IP exacta
      const box = this.gridIps.find(b => b.address === device.ip);
      
      if (box) {
        if (device.is_alive) {
          box.status = 'alive';
          box.statusLabel = 'Online';
        } else {
          box.status = 'down';
          box.statusLabel = 'Caído / Offline';
        }
        
        box.user = device.hostname || device.mac_address || 'Sin nombre';
        if (device.open_ports && device.open_ports.length > 0) {
          box.openPorts = device.open_ports.join(', ');
        } else {
          box.openPorts = undefined;
        }
      }
    });
  }

  triggerScan() {
    if (!this.selectedNetworkId || this.isScanning) return;
    
    this.isScanning = true;
    console.log('Iniciando scan manual en backend...');
    
    this.networksService.triggerScan(this.selectedNetworkId).subscribe({
      next: () => {
        // Ya no hacemos polling manual.
        // El WebSocket empujará los datos cuando el backend termine de escanear.
      },
      error: (err) => {
        console.error('Error disparando scan', err);
        this.isScanning = false;
      }
    });
  }
}
