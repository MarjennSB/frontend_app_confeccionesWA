export interface DeviceInventory {
    device_id: number;
    device_type: string | null;
    manufacturer: string | null;
    model: string | null;
    description: string | null;
    location: string | null;
    contact: string | null;
    os_info: string | null;
    cpu_model: string | null;
    ram_mb: number | null;
    disk_gb: number | null;
    interfaces: any | null;
    uptime_seconds: number | null;
    read_method: string | null;
    last_updated: string | null;
}
