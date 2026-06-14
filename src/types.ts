export type UserRole = "patient" | "pharmacy" | "doctor" | "admin";

export interface User {
  id: string;
  phone: string;
  email: string | null;
  name: string;
  role: UserRole;
  is_verified: boolean;
  address: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export type MedicineType = "Tablet" | "Capsule" | "Syrup" | "Injection" | "Ointment" | "Drops" | "Inhaler" | "Powder";

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  composition: string;
  type: MedicineType;
  category: string;
  price: number;
  mrp: number;
  discount_pct: number;
  stock: number;
  requires_prescription: boolean;
  trust_score: number;
  pharmacy_id: string;
  images: string[];
  pack_size: string;
  rating: number;
  review_count: number;
  is_active: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  license_number: string;
  address: string;
  lat: number;
  lng: number;
  trust_score: number;
  delivery_time_min: number;
  is_verified: boolean;
  is_offline: boolean;
  has_delivery: boolean;
  has_pickup: boolean;
  phone: string;
  hours: string;
  services: string[];
  ratings: number;
  image: string;
}

export interface CartItem {
  medicineId: string;
  quantity: number;
  pickupPharmacyId?: string | null; // For local pickup orders
}

export interface Cart {
  user_id: string;
  items: CartItem[];
  total_amount: number;
  prescription_verified: boolean;
  prescription_id: string | null;
  order_type: "delivery" | "pickup";
  pickup_pharmacy_id: string | null;
}

export type OrderStatus = "pending" | "confirmed" | "dispatched" | "ready_for_pickup" | "delivered" | "cancelled";

export interface Order {
  id: string;
  user_id: string;
  pharmacy_id: string;
  status: OrderStatus;
  address: string | null;
  total: number;
  prescription_id: string | null;
  tracking_id: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  order_type: "delivery" | "pickup";
  pickup_code: string | null;
  created_at: string;
  items: {
    medicine: Medicine;
    quantity: number;
  }[];
}

export interface Prescription {
  id: string;
  user_id: string;
  image_url: string;
  status: "pending" | "processing" | "verified" | "failed";
  doctor_name: string | null;
  doctor_reg_number: string | null;
  prescription_date: string | null;
  extracted_medicines: Record<string, string> | null;
  confidence_score: number | null;
  failure_reason: string | null;
  verified_at: string | null;
  created_at: string;
  is_bill_valid?: boolean;
  no_toxic_medicine?: boolean;
  true_hospital?: boolean;
  true_doctor?: boolean;
  not_ai_generated?: boolean;
  handwriting_analysis?: string;
  sarvam_clean_text?: string;
  sarvam_originality_score?: number;
}

export interface Verification {
  id: string;
  order_id: string;
  user_id: string;
  medicine_id: string;
  front_image_url: string;
  back_image_url: string;
  barcode_image_url: string | null;
  status: "pending" | "genuine" | "concern" | "fake";
  authenticity_score: number | null;
  issues: string[] | null;
  extracted_batch: string | null;
  extracted_expiry: string | null;
  created_at: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience_years: number;
  fee: number;
  rating: number;
  is_available: boolean;
  languages: string[];
  image: string;
}
