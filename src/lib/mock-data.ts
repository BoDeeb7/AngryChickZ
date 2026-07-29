
export const MOCK_DATA = [
  {
    id: 'mock-1',
    name: 'The Angry Inferno Burger',
    description: 'Triple-stacked crispy chicken thighs, dipped in our signature Ghost Pepper oil, topped with jalapeño slaw and melted cheddar.',
    price: 12.99,
    category: 'burgers',
    imageUrls: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&h=800&auto=format&fit=crop'],
    badges: ['Spicy', 'Best Seller'],
    createdAt: { seconds: Date.now() / 1000 }
  },
  {
    id: 'mock-2',
    name: 'Classic Crispy Bucket',
    description: '8 pieces of our famous 24-hour brined crispy chicken. Served with honey-mustard dip and signature spices.',
    price: 24.50,
    category: 'crispy-meals',
    imageUrls: ['https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800&h=800&auto=format&fit=crop'],
    badges: ['Family Favorite'],
    createdAt: { seconds: (Date.now() / 1000) - 3600 }
  },
  {
    id: 'mock-3',
    name: 'Madagascar Vanilla Shake',
    description: 'Premium vanilla bean blended with golden salted caramel and topped with honeycomb crunch.',
    price: 6.75,
    category: 'drinks',
    imageUrls: ['https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&h=800&auto=format&fit=crop'],
    badges: ['New'],
    createdAt: { seconds: (Date.now() / 1000) - 7200 }
  },
  {
    id: 'mock-4',
    name: 'Truffle Parmesan Fries',
    description: 'Double-fried hand-cut potatoes tossed in white truffle oil, parmesan snow, and sea salt.',
    price: 8.25,
    category: 'sides',
    imageUrls: ['https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800&h=800&auto=format&fit=crop'],
    badges: ['Trending'],
    createdAt: { seconds: (Date.now() / 1000) - 10800 }
  }
];
