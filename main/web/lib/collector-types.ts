export type PickupStatus = 'REQUESTED' | 'ACCEPTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | 'MISSED';

export interface CollectorPickup {
  id: string;
  customer_name: string;
  customer_phone: string;
  pickup_address: string;
  status: PickupStatus;
  scheduled_time: string | null;
  requested_time: string;
  expected_material: string;
  estimated_quantity_kg: number;
  estimated_value_min: number;
  estimated_value_max: number;
  created_at: string;
  cancellation_reason?: string | null;
}

export interface ScrapItem {
  id: string;
  material_category: string;
  quantity_kg: number;
  value: number;
}

export interface Transaction {
  id: string;
  pickup_id: string;
  collector_id: string;
  actual_quantity_kg: number;
  actual_value: number;
  transaction_date: string; // ISO date
  created_at: string; // ISO string
  items: ScrapItem[];
}
