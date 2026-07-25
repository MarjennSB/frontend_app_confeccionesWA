import { RequestCertificate } from './request-certificate.model';
import { Status } from './status.model';
import { ResponsibleOfficer } from './responsible-officer.model';
import { Area } from './area.model';

export interface CertificateDetail {
  id: string;
  description_landlord_service: string;
  order_number?: string;
  siaf_file_number?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  area?: Area;
}

export interface Certificate {
  id: string;
  certificate_number?: string;
  certificate_year?: number;
  issue_date?: string;
  responsible_name?: string;
  responsible_charge?: string;
  responsible_initials?: string;
  motto_of_the_year?: string;
  user_initials?: string;
  template?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  request?: RequestCertificate;
  status?: Status;
  responsible_officer?: ResponsibleOfficer;
  details?: CertificateDetail[];
}

export interface GenerateCertificateDto {
  request_id: string;
  service_ids: string[];
}
