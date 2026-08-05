'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, CartItem, StoreSettings } from '@/types/restaurant';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  currency: 'USD' | 'LBP';
  setCurrency: (c: 'USD' | 'LBP') => void;
  exchangeRate: number;
  formatPrice: (price: number) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrencyState] = useState<'USD' | 'LBP'>('USD');
  const db = useFirestore();
  
  const storeSettingsRef = useMemo(() => db ? doc(db, 'settings', 'store') : null, [db]);
  const { data: storeSettings } = useDoc<StoreSettings>(storeSettingsRef);

  const exchangeRate = storeSettings?.exchangeRate || 90000;

  useEffect(() => {
    const savedCart = localStorage.getItem('angry_chickz_cart');
    const savedCurrency = localStorage.getItem('angry_chickz_currency') as 'USD' | 'LBP';
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
    if (savedCurrency) setCurrencyState(savedCurrency);
  }, []);

  useEffect(() => {
    localStorage.setItem('angry_chickz_cart', JSON.stringify(cart));
  }, [cart]);

  const setCurrency = (c: 'USD' | 'LBP') => {
    setCurrencyState(c);
    localStorage.setItem('angry_chickz_currency', c);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const updateNotes = (productId: string, notes: string) => {
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, notes } : item
    ));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (price: number) => {
    if (currency === 'USD') return `$${price.toFixed(2)}`;
    return `${(Math.round(price * exchangeRate / 1000) * 1000).toLocaleString()} L.L.`;
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateNotes,
      clearCart,
      subtotal,
      itemCount,
      currency,
      setCurrency,
      exchangeRate,
      formatPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
