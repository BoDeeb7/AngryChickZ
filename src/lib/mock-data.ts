
export const MOCK_PRODUCTS = [
  {
    name: "Angry Signature Burger",
    description: "Our world-famous triple-crunch spicy chicken breast, slaw, pickles, and secret angry sauce on a toasted brioche bun.",
    price: 12.99,
    category: "burgers",
    imageUrls: ["https://picsum.photos/seed/angry-burger/800/800"],
    badges: ["Best Seller", "Spicy"],
    createdAt: new Date().toISOString()
  },
  {
    name: "Atomic Wings (6pcs)",
    description: "Jumbo wings tossed in our signature Nashville-style dry rub. Available in 5 heat levels.",
    price: 10.50,
    category: "wings",
    imageUrls: ["https://picsum.photos/seed/atomic-wings/800/800"],
    badges: ["Extreme Heat"],
    createdAt: new Date().toISOString()
  },
  {
    name: "Loaded Angry Fries",
    description: "Crispy fries topped with chopped spicy chicken, cheese sauce, jalapeños, and angry drizzle.",
    price: 8.95,
    category: "sides",
    imageUrls: ["https://picsum.photos/seed/loaded-fries/800/800"],
    badges: ["Fan Favorite"],
    createdAt: new Date().toISOString()
  },
  {
    name: "Angry Tender Box",
    description: "3 giant hand-breaded tenders served with white bread, pickles, and a side of fries.",
    price: 14.50,
    category: "tenders",
    imageUrls: ["https://picsum.photos/seed/tenders-box/800/800"],
    badges: ["New"],
    createdAt: new Date().toISOString()
  }
];

export const MOCK_CATEGORIES = [
  { name: "Burgers", slug: "burgers" },
  { name: "Wings", slug: "wings" },
  { name: "Tenders", slug: "tenders" },
  { name: "Sides", slug: "sides" }
];
