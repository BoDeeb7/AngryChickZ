
export const MOCK_DATA = [
  {
    id: 'mock-1',
    name: 'The Angry Inferno Burger',
    description: 'Triple-stacked crispy chicken thighs, dipped in our signature Ghost Pepper oil, topped with jalapeño slaw and lava sauce.',
    price: 12.99,
    category: 'Burgers',
    imageUrls: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&h=800&auto=format&fit=crop'],
    badges: ['Spicy', 'Best Seller'],
    createdAt: { seconds: Date.now() / 1000 }
  },
  {
    id: 'mock-2',
    name: 'Golden Heat Bucket',
    description: '8 pieces of our famous 24-hour brined crispy chicken. Served with honey-mustard dip and atomic dust.',
    price: 24.50,
    category: 'Crispy Meals',
    imageUrls: ['https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800&h=800&auto=format&fit=crop'],
    badges: ['Elite'],
    createdAt: { seconds: (Date.now() / 1000) - 3600 }
  },
  {
    id: 'mock-3',
    name: 'Liquid Gold Shake',
    description: 'Premium Madagascar vanilla bean blended with golden salted caramel and topped with honeycomb crunch.',
    price: 6.75,
    category: 'Drinks',
    imageUrls: ['https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&h=800&auto=format&fit=crop'],
    badges: ['New'],
    createdAt: { seconds: (Date.now() / 1000) - 7200 }
  },
  {
    id: 'mock-4',
    name: 'Voodoo Truffle Fries',
    description: 'Double-fried hand-cut potatoes tossed in white truffle oil, parmesan snow, and volcanic salt.',
    price: 8.25,
    category: 'Add-ons',
    imageUrls: ['https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800&h=800&auto=format&fit=crop'],
    badges: ['Trending'],
    createdAt: { seconds: (Date.now() / 1000) - 10800 }
  }
];
