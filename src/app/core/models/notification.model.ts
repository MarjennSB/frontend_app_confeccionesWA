export interface Notification {
    id: string; // UUID in backend
    title: string;
    message: string;
    image_url?: string;
    destination_url?: string;
    start_date?: Date | string;
    end_date?: Date | string;
    is_active: boolean;
}