export interface Vlan {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateVlanDto {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateVlanDto {
  name?: string;
  description?: string;
  is_active?: boolean;
}
