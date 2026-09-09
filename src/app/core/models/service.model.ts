import { ServiceTypes } from './service-types.model';

export interface Service {
    id: string;
    service_type_id: string | number;
    title: string;
    subtitle: string;
    description?: string;
    destination_url?: string;
    image_url?: string;
    display_order: number;
    is_active: boolean;
    type?: ServiceTypes;
}

