export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrls: string[];
  badges: string[];
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
