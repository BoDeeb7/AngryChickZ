
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrls: string[];
  badges: string[];
  currency?: 'USD' | 'LBP';
  isAvailable?: boolean;
  createdAt?: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CartItem extends Product {
  quantity: number;
  notes?: string;
}

export interface Order {
  id?: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'completed';
  createdAt: any;
  notes?: string;
  gpsLocation?: string;
}

export interface OrderDetails {
  customerName: string;
  phoneNumber: string;
  address: string;
  paymentMethod: 'Cash on Delivery' | 'Wish Money';
}

export interface Review {
  id?: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface StoreSettings {
  phone: string;
  address: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  whatsappNumber: string;
  openingHours: string;
  logo?: string;
}
