export interface PaginatedNetworks<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }
}

export interface NetworkDevicesResponse<T> {
  network_id: number;
  cidr: string;
  total: number;
  devices: T[];
}
