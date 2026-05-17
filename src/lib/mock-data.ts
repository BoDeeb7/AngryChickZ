
import { Product, DashboardMetric } from '@/types/shop';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Aero-X Headphones',
    description: 'Noise cancelling, spatial audio, 40h battery life.',
    price: 349.99,
    category: 'Tech',
    imageUrl: PlaceHolderImages.find(img => img.id === 'tech-1')?.imageUrl || '',
    badge: 'Hot',
    stock: 45,
    status: 'In Stock',
    tags: ['wireless', 'premium', 'audio']
  },
  {
    id: '2',
    name: 'Velozi Smart Watch 5',
    description: 'OLED Display, Heart rate monitoring, GPS tracking.',
    price: 499.00,
    category: 'Tech',
    imageUrl: PlaceHolderImages.find(img => img.id === 'tech-2')?.imageUrl || '',
    stock: 12,
    status: 'Low Stock',
    tags: ['fitness', 'wearable']
  },
  {
    id: '3',
    name: 'Neo-City Jacket',
    description: 'Waterproof, techwear inspired, modular design.',
    price: 189.99,
    category: 'Fashion',
    imageUrl: PlaceHolderImages.find(img => img.id === 'fashion-1')?.imageUrl || '',
    badge: 'New',
    stock: 80,
    status: 'In Stock',
    tags: ['outerwear', 'style']
  },
  {
    id: '4',
    name: 'Flux Sneakers',
    description: 'Reactive foam, glow-in-the-dark accents.',
    price: 145.00,
    category: 'Fashion',
    imageUrl: PlaceHolderImages.find(img => img.id === 'fashion-2')?.imageUrl || '',
    stock: 0,
    status: 'Out of Stock',
    tags: ['footwear', 'active']
  },
  {
    id: '5',
    name: 'Velozi Hydro X',
    description: 'Double insulated, 24h cold storage.',
    price: 35.00,
    category: 'Lifestyle',
    imageUrl: PlaceHolderImages.find(img => img.id === 'lifestyle-1')?.imageUrl || '',
    stock: 150,
    status: 'In Stock',
    tags: ['essentials', 'eco']
  },
  {
    id: '6',
    name: 'Aura Yoga Mat',
    description: 'High-grip surface, biodegradable materials.',
    price: 75.00,
    category: 'Lifestyle',
    imageUrl: PlaceHolderImages.find(img => img.id === 'lifestyle-2')?.imageUrl || '',
    stock: 25,
    status: 'In Stock',
    tags: ['fitness', 'health']
  },
  {
    id: '7',
    name: 'Onyx Carbon Wallet',
    description: 'RFID blocking, aircraft-grade carbon fiber.',
    price: 89.00,
    category: 'Accessories',
    imageUrl: PlaceHolderImages.find(img => img.id === 'acc-1')?.imageUrl || '',
    badge: 'Sale',
    stock: 60,
    status: 'In Stock',
    tags: ['daily', 'luxury']
  },
  {
    id: '8',
    name: 'Horizon Aviators',
    description: 'Polarized lenses, titanium frames.',
    price: 210.00,
    category: 'Accessories',
    imageUrl: PlaceHolderImages.find(img => img.id === 'acc-2')?.imageUrl || '',
    stock: 34,
    status: 'In Stock',
    tags: ['fashion', 'eyewear']
  }
];

export const MOCK_METRICS: DashboardMetric[] = [
  { label: 'Total Revenue', value: '$128,430', change: '+12.5%', isPositive: true },
  { label: 'Total Orders', value: '1,240', change: '+18.2%', isPositive: true },
  { label: 'Active Users', value: '4,821', change: '-2.4%', isPositive: false },
  { label: 'Conversion Rate', value: '3.45%', change: '+0.5%', isPositive: true }
];
