export interface Area {
  id: number;
  acronym: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: Area;
  children?: Area[];
}

export interface CreateAreaDto {
  acronym: string;
  name: string;
  area_father_id?: number;
}

export interface UpdateAreaDto {
  acronym?: string;
  name?: string;
  area_father_id?: number;
  is_active?: boolean;
}
