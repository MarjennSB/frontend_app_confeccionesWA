import { Landlord } from './landlord.model';
import { Area } from './area.model';

export interface LandlordService {
  id: string;
  service_description: string;
  order_number?: string;
  siaf_file_number?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  landlord?: Landlord;
  area?: Area;
}

export interface CreateLandlordServiceDto {
  service_description: string;
  order_number?: string;
  siaf_file_number?: string;
  start_date?: string;
  end_date?: string;
  landlord_id: string;
  area_id?: number | null;
}

export interface UpdateLandlordServiceDto {
  service_description?: string;
  order_number?: string;
  siaf_file_number?: string;
  start_date?: string;
  end_date?: string;
  area_id?: number | null;
  is_active?: boolean;
}
