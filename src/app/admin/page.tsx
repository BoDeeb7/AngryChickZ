'use client';

import { useState, useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Upload, 
  Loader2, 
  LayoutGrid, 
  List, 
  Utensils, 
  ShieldCheck, 
  ArrowLeft, 
  Star, 
  MessageSquare, 
  Lock, 
  Settings, 
  Image as ImageIcon, 
  Globe, 
  Phone, 
  MapPin,
  Save,
  LogOut,
  X,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Product, Category, Review, StoreSettings } from '@/types/restaurant';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    phone: '+961 70 105 152',
    address: 'Elite Kitchen, Central District',
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    tiktok: 'https://tiktok.com',
    whatsappNumber: '70105152',
    openingHours: '12:00 PM - 12:00 AM'
  });
  const [heroSettings, setHeroSettings] = useState({
    bgImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop',
    bannerHeadline: 'LEVEL 5 HEAT',
    bannerText: 'Elite Signature Release'
  });

  useEffect(() => {
    return () => {
      setIsAuthenticated(false);
    };
  }, []);

  useEffect(() => {
    const savedProducts = localStorage.getItem('angry_chickz_products');
    const savedCats = localStorage.getItem('angry_chickz_categories');
    const savedReviews = localStorage.getItem('angry_chickz_reviews');
    const savedStore = localStorage.getItem('angry_chickz_store_settings');
    const savedHero = localStorage.getItem('angry_chickz_hero_settings');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCats) setCategories(JSON.parse(savedCats));
    if (savedReviews) setReviews(JSON.parse(savedReviews));
    if (savedStore) setStoreSettings(JSON.parse(savedStore));
    if (savedHero) setHeroSettings(JSON.parse(savedHero));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('angry_chickz_products', JSON.stringify(products));
      localStorage.setItem('angry_chickz_categories', JSON.stringify(categories));
      localStorage.setItem('angry_chickz_reviews', JSON.stringify(reviews));
      localStorage.setItem('angry_chickz_store_settings', JSON.stringify(storeSettings));
      localStorage.setItem('angry_chickz_hero_settings', JSON.stringify(heroSettings));
    }
  }, [products, categories, reviews, storeSettings, heroSettings, isAuthenticated]);

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrls: [] as string[],
    badges: [] as string[],
  });

  const [newCategory, setNewCategory] = useState({ name: '', slug: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'Ali@AngryChickZ' && loginForm.password === 'AngryChickZ@DeebData#79') {
      setIsAuthenticated(true);
      toast({ title: "Welcome back, Ali", description: "System authorized." });
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "Invalid credentials." });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'heroBg' | 'heroBanner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (target === 'product') {
        setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, base64] }));
      } else if (target === 'heroBg') {
        setHeroSettings(prev => ({ ...prev, bgImage: base64 }));
      } else if (target === 'heroBanner') {
        setHeroSettings(prev => ({ ...prev, bannerImage: base64 }));
      }
      setIsUploading(false);
      toast({ title: "Visual Uploaded" });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast({ variant: "destructive", title: "Missing Info", description: "Required fields empty." });
      return;
    }

    const newProduct: Product = {
      id: isEditing || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      imageUrls: formData.imageUrls,
      badges: formData.badges,
      createdAt: new Date().toISOString()
    };

    if (isEditing) {
      setProducts(prev => prev.map(p => p.id === isEditing ? newProduct : p));
    } else {
      setProducts(prev => [newProduct, ...prev]);
    }
    resetForm();
    toast({ title: "Product Synchronized" });
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', category: '', imageUrls: [], badges: [] });
    setIsEditing(null);
  };

  const startEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      imageUrls: product.imageUrls || [],
      badges: product.badges || [],
    });
    setIsEditing(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteProduct = (id: string) => {
    if (confirm('Delete this product permanently?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Product Removed" });
    }
  };

  const addCategory = () => {
    if (!newCategory.name) return;
    const slug = newCategory.name.toLowerCase().replace(/\s+/g, '-');
    setCategories(prev => [...prev, { id: Date.now().toString(), name: newCategory.name, slug }]);
    setNewCategory({ name: '', slug: '' });
    toast({ title: "Category Created" });
  };

  const deleteCategory = (id: string) => {
    if (confirm('Remove this category?')) {
      setCategories(prev => prev.filter(c => c.id !== id));
      toast({ title: "Category Removed" });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pt-10 pb-6">
            <div className="h-16 w-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="h-8 w-8 text-zinc-950" />
            </div>
            <CardTitle className="text-2xl font-bold text-zinc-100 tracking-tight">Admin Terminal</CardTitle>
            <p className="text-sm text-zinc-500 mt-2">Authorized Personnel Only</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Username</Label>
                <Input 
                  type="text" 
                  value={loginForm.username} 
                  onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))}
                  className="h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Password</Label>
                <Input 
                  type="password" 
                  value={loginForm.password} 
                  onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                  className="h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl mt-4">
                Authenticate
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950">
      <div className="container mx-auto max-w-6xl p-4 md:p-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Executive Management</h1>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mt-1">Status: Authenticated</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link href="/" className="flex-1 md:flex-none">
              <Button variant="outline" className="w-full bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl h-11">
                <ArrowLeft className="h-4 w-4 mr-2" /> Live Site
              </Button>
            </Link>
            <Button variant="ghost" onClick={() => setIsAuthenticated(false)} className="text-red-400 hover:bg-red-500/10 rounded-xl h-11 px-4">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </header>

        <Tabs defaultValue="products" className="space-y-8">
          <div className="w-full overflow-x-auto no-scrollbar bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800">
            <TabsList className="bg-transparent h-12 w-full justify-start md:justify-center gap-1 flex-nowrap min-w-max px-2">
              {[
                { value: 'products', icon: Utensils, label: 'Menu Items' },
                { value: 'categories', icon: List, label: 'Categories' },
                { value: 'storefront', icon: ImageIcon, label: 'Visuals' },
                { value: 'storeinfo', icon: Globe, label: 'Store Info' },
                { value: 'reviews', icon: MessageSquare, label: 'Customer Sentiment' },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="px-6 rounded-xl h-10 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950 text-zinc-500 transition-all whitespace-nowrap"
                >
                  <tab.icon className="h-4 w-4 mr-2" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* MENU ITEMS */}
          <TabsContent value="products" className="grid lg:grid-cols-12 gap-8 focus:outline-none">
            <Card className="lg:col-span-5 bg-zinc-900 border-zinc-800 rounded-3xl overflow-hidden shadow-xl h-fit sticky top-8">
              <CardHeader className="border-b border-zinc-800 p-6">
                <CardTitle className="text-xl font-bold flex items-center gap-3 text-amber-500">
                  {isEditing ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {isEditing ? 'Modify Item' : 'New Menu Item'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Item Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} 
                    className="bg-zinc-800 border-zinc-700 rounded-xl h-11 text-white placeholder:text-zinc-600"
                    placeholder="e.g. Signature Wings"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</Label>
                  <Textarea 
                    value={formData.description} 
                    onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} 
                    className="bg-zinc-800 border-zinc-700 rounded-xl min-h-[100px] text-white placeholder:text-zinc-600"
                    placeholder="Describe ingredients and heat level..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Price ($)</Label>
                    <Input 
                      type="number" 
                      value={formData.price} 
                      onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} 
                      className="bg-zinc-800 border-zinc-700 rounded-xl h-11 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Category</Label>
                    <select 
                      className="w-full h-11 px-4 bg-zinc-800 border border-zinc-700 rounded-xl outline-none text-sm text-white focus:border-amber-500"
                      value={formData.category}
                      onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    >
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Item Photography</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {formData.imageUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800 group">
                        <Image src={url} alt="preview" fill className="object-cover" />
                        <button 
                          onClick={() => setFormData(f => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }))}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square flex flex-col items-center justify-center bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-amber-500 transition-all">
                      {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-amber-500" /> : <Upload className="h-5 w-5 text-zinc-500" />}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'product')} />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveProduct} className="flex-grow h-12 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl">
                    {isEditing ? 'Update Item' : 'Add to Catalog'}
                  </Button>
                  {isEditing && (
                    <Button variant="ghost" onClick={resetForm} className="h-12 w-12 rounded-xl bg-zinc-800 text-zinc-400">
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <LayoutGrid className="h-5 w-5 text-amber-500" /> Current Catalog
                </h2>
                <Badge className="bg-zinc-800 text-amber-500 border-zinc-700">{products.length} Items</Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex gap-4 items-center group hover:border-amber-500/30 transition-all">
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800">
                      <Image src={product.imageUrls[0] || 'https://picsum.photos/seed/food/200/200'} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-zinc-100 truncate">{product.name}</h4>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{product.category}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-amber-500 text-sm">${product.price.toFixed(2)}</span>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-zinc-100" onClick={() => startEdit(product)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-500/10" onClick={() => deleteProduct(product.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* CATEGORIES TAB */}
          <TabsContent value="categories" className="max-w-xl mx-auto space-y-6 focus:outline-none">
            <Card className="bg-zinc-900 border-zinc-800 rounded-3xl p-6 shadow-xl">
              <CardHeader className="px-0 pt-0 pb-6 border-b border-zinc-800 mb-6">
                <CardTitle className="text-xl font-bold">Category Management</CardTitle>
                <p className="text-xs text-zinc-500 mt-1">Add or remove menu categories (e.g., Burgers, Drinks)</p>
              </CardHeader>
              <div className="space-y-6">
                <div className="flex gap-3">
                  <Input 
                    placeholder="New Category Name..." 
                    value={newCategory.name} 
                    onChange={e => setNewCategory(c => ({ ...c, name: e.target.value }))}
                    className="h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl"
                  />
                  <Button onClick={addCategory} className="h-12 w-12 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl p-0">
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
                <div className="grid gap-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all">
                      <span className="font-bold text-zinc-200 text-sm">{cat.name}</span>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:bg-red-500/10" onClick={() => deleteCategory(cat.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {categories.length === 0 && <p className="text-center py-8 text-zinc-500 text-sm">No categories defined yet.</p>}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* VISUALS TAB */}
          <TabsContent value="storefront" className="max-w-4xl mx-auto space-y-6 focus:outline-none">
            <Card className="bg-zinc-900 border-zinc-800 rounded-3xl p-8 shadow-xl">
              <CardHeader className="px-0 pt-0 pb-6 border-b border-zinc-800 mb-8">
                <CardTitle className="text-xl font-bold text-amber-500 flex items-center gap-3">
                  <ImageIcon className="h-5 w-5" /> Global Visuals
                </CardTitle>
              </CardHeader>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Hero Background</Label>
                  <div className="relative h-40 w-full rounded-2xl overflow-hidden border-2 border-dashed border-zinc-800 bg-zinc-800 group">
                    <Image src={heroSettings.bgImage} alt="hero-bg" fill className="object-cover" />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Upload className="h-6 w-6 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'heroBg')} />
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Featured Banner</Label>
                  <div className="relative h-40 w-full rounded-2xl overflow-hidden border-2 border-dashed border-zinc-800 bg-zinc-800 group">
                    <Image src={heroSettings.bannerImage} alt="hero-banner" fill className="object-cover" />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Upload className="h-6 w-6 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'heroBanner')} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Banner Headline</Label>
                  <Input 
                    value={heroSettings.bannerHeadline} 
                    onChange={e => setHeroSettings(p => ({ ...p, bannerHeadline: e.target.value }))}
                    className="bg-zinc-800 border-zinc-700 h-11 text-white rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Banner Subtext</Label>
                  <Input 
                    value={heroSettings.bannerText} 
                    onChange={e => setHeroSettings(p => ({ ...p, bannerText: e.target.value }))}
                    className="bg-zinc-800 border-zinc-700 h-11 text-white rounded-xl"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* STORE INFO TAB */}
          <TabsContent value="storeinfo" className="max-w-4xl mx-auto space-y-6 focus:outline-none">
            <Card className="bg-zinc-900 border-zinc-800 rounded-3xl p-8 shadow-xl">
              <CardHeader className="px-0 pt-0 pb-6 border-b border-zinc-800 mb-8">
                <CardTitle className="text-xl font-bold text-amber-500">Global Contact Identity</CardTitle>
              </CardHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Public Phone</Label>
                  <Input 
                    value={storeSettings.phone} 
                    onChange={e => setStoreSettings(p => ({ ...p, phone: e.target.value }))}
                    className="bg-zinc-800 border-zinc-700 h-11 text-white rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">WhatsApp ID</Label>
                  <Input 
                    value={storeSettings.whatsappNumber} 
                    onChange={e => setStoreSettings(p => ({ ...p, whatsappNumber: e.target.value }))}
                    className="bg-zinc-800 border-zinc-700 h-11 text-white rounded-xl"
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Store Address</Label>
                  <Textarea 
                    value={storeSettings.address} 
                    onChange={e => setStoreSettings(p => ({ ...p, address: e.target.value }))}
                    className="bg-zinc-800 border-zinc-700 min-h-[80px] text-white rounded-xl"
                  />
                </div>
                {['instagram', 'facebook', 'tiktok'].map((platform) => (
                  <div key={platform} className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{platform} Link</Label>
                    <Input 
                      value={storeSettings[platform as keyof StoreSettings] as string} 
                      onChange={e => setStoreSettings(p => ({ ...p, [platform]: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 h-11 text-white rounded-xl"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* REVIEWS TAB */}
          <TabsContent value="reviews" className="space-y-6 focus:outline-none">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-amber-500" /> Sentiment Analysis
              </h2>
              <Badge className="bg-amber-500 text-zinc-950 border-none font-bold">{reviews.length} Feedbacks</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, idx) => (
                <Card key={idx} className="bg-zinc-900 border-zinc-800 rounded-3xl p-6 relative group hover:border-amber-500/20 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-zinc-100">{review.customerName}</h4>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`h-3 w-3 ${i <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-800'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed italic">"{review.comment}"</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10"
                    onClick={() => {
                      if(confirm('Delete review?')) setReviews(prev => prev.filter((_, i) => i !== idx));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
              {reviews.length === 0 && (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
                  <p className="text-zinc-500 text-sm font-medium">No reviews logged yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}