/**
 * Entity interfaces that match the database tables
 */

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role_id: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  phone: string;
  email: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Package {
  id: number;
  tracking_number: string;
  sender_name: string;
  receiver_name: string;
  sender_address: string;
  receiver_address: string;
  origin_branch_id: number;
  destination_branch_id: number;
  weight_kg: number;
  volume_cm3: number;
  price: number;
  status: "Pending" | "In Transit" | "Delivered" | "Cancelled" | "Returned";
  created_at: Date;
  updated_at: Date;
}
