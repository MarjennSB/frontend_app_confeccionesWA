export interface ScanResult {
    id: number;
    network_id: number;
    status: string;
    hosts_up: number;
    hosts_down: number;
    total_hosts: number;
    started_at: string;
    finished_at: string | null;
    error_message: string | null;
}
