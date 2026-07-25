import { Landlord } from './landlord.model';
import { Status } from './status.model';

export interface CertificateSummary {
  id: string;
  certificate_number?: string;
  certificate_year?: number;
}

export interface RequestCertificate {
  id: string;
  file_number?: string;
  file_date?: string;
  reason_request?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  landlord?: Landlord;
  status?: Status;
  certificate?: CertificateSummary | null;
}

export interface CreateRequestCertificateDto {
  landlord_id: string;
  file_number?: string;
  file_date?: string;
  reason_request?: string;
  status_id?: number | null;
}

export interface UpdateRequestCertificateDto {
  file_number?: string;
  file_date?: string;
  reason_request?: string;
  status_id?: number | null;
  is_active?: boolean;
}
