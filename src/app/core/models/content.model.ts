import { ContentType } from './content-types.model';

export interface Content {
    id: string; // El backend usa UUIDs
    content_type_id: number;
    title: string;
    subtitle?: string;
    description?: string;
    image_url?: string;
    destination_url?: string;
    start_date?: Date | string;
    end_date?: Date | string;
    display_order: number;
    is_active: boolean;
    type?: ContentType; // Relación con el tipo de contenido
}