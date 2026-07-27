import { Injectable } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WsMessage {
  type: string;
  devices?: any[];
  mode?: string;
  is_scanning?: boolean;
  last_scan_at?: string;
  next_scan_at?: string;
  open_ports?: number[];
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private ws: WebSocket | null = null;
  private globalWs: WebSocket | null = null;
  private messageSubject: Subject<WsMessage> = new Subject<WsMessage>();
  private globalMessageSubject: Subject<WsMessage> = new Subject<WsMessage>();
  private reconnectInterval: any;
  private globalReconnectInterval: any;
  private currentNetworkId: number | null = null;

  constructor() {}

  /**
   * Conecta al WebSocket de alertas globales.
   */
  public connectGlobal(): void {
    if (this.globalWs) return;

    const baseUrl = environment.apiUrl.replace('http', 'ws').replace('/api/v1', '');
    const wsUrl = `${baseUrl}/ws/alerts`;

    console.log(`[WebSocket Global] Conectando a ${wsUrl}`);
    this.globalWs = new WebSocket(wsUrl);

    this.globalWs.onopen = () => {
      console.log('[WebSocket Global] Conexión establecida.');
      if (this.globalReconnectInterval) {
        clearInterval(this.globalReconnectInterval);
        this.globalReconnectInterval = null;
      }
    };

    this.globalWs.onmessage = (event) => {
      try {
        const data: WsMessage = JSON.parse(event.data);
        this.globalMessageSubject.next(data);
      } catch (e) {
        console.error('[WebSocket Global] Error parseando mensaje', e);
      }
    };

    this.globalWs.onclose = () => {
      console.warn('[WebSocket Global] Conexión cerrada.');
      this.globalWs = null;
      if (!this.globalReconnectInterval) {
        this.globalReconnectInterval = setInterval(() => this.connectGlobal(), 5000);
      }
    };
  }

  public onGlobalMessage(): Observable<WsMessage> {
    return this.globalMessageSubject.asObservable();
  }

  /**
   * Conecta al WebSocket de una red específica.
   */
  public connect(networkId: number): void {
    this.currentNetworkId = networkId;
    this._connect();
  }

  private _connect(): void {
    if (!this.currentNetworkId) return;

    // Desconectar si ya existe una conexión previa (sin limpiar el ID)
    this.disconnect(false);

    // Construir la URL del WS dinámicamente desde el environment.apiUrl
    // de http://127.0.0.1:8000/api/v1  ->  ws://127.0.0.1:8000/ws/networks/{id}
    const baseUrl = environment.apiUrl.replace('http', 'ws').replace('/api/v1', '');
    const wsUrl = `${baseUrl}/ws/networks/${this.currentNetworkId}`;

    console.log(`[WebSocket] Conectando a ${wsUrl}`);
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('[WebSocket] Conexión establecida.');
      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data: WsMessage = JSON.parse(event.data);
        this.messageSubject.next(data);
      } catch (e) {
        console.error('[WebSocket] Error parseando mensaje', e);
      }
    };

    this.ws.onclose = () => {
      console.warn('[WebSocket] Conexión cerrada.');
      this.ws = null;
      // Lógica simple de reconexión si no fue cerrada intencionalmente
      if (this.currentNetworkId && !this.reconnectInterval) {
        console.log('[WebSocket] Intentando reconectar en 5s...');
        this.reconnectInterval = setInterval(() => this._connect(), 5000);
      }
    };

    this.ws.onerror = (err) => {
      console.error('[WebSocket] Error de conexión', err);
      if (this.ws) {
        this.ws.close();
      }
    };
  }

  /**
   * Devuelve un Observable al que los componentes pueden suscribirse
   * para escuchar los eventos que llegan del WebSocket.
   */
  public onMessage(): Observable<WsMessage> {
    return this.messageSubject.asObservable();
  }

  /**
   * Cierra la conexión intencionalmente (ej. al salir del componente)
   */
  public disconnect(clearId = true): void {
    if (clearId) {
      this.currentNetworkId = null; // Evita la reconexión automática
    }
    
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
