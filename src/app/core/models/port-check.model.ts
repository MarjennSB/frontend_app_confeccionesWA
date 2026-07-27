export interface PortCheck {
    id: number;
    device_id: number;
    scan_id: number | null;
    port: number;
    is_open: boolean;
    service_name: string | null;
    checked_at: string;
}
