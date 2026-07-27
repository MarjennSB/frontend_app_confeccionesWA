export interface DeviceStat {
    id: number;
    device_id: number;
    is_alive: boolean;
    ping_ms: number | null;
    timestamp: string;
}
