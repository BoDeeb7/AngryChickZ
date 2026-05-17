
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  badge?: string;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  change: string;
  isPositive: boolean;
}
