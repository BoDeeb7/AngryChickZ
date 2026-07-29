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
  X
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

  // Load Initial Data from LocalStorage
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

  // Security: Auto-logout when navigating away
  useEffect(() => {
    return () => {
      setIsAuthenticated(false);
    };
  }, []);

  // Hydrate Data on Mount
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

  // Auto-Save Logic
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
      toast({ title: "Access Granted", description: "Welcome back, Ali." });
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
      toast({ title: "Image Uploaded", description: "Visual data synchronized." });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast({ variant: "destructive", title: "Missing Information", description: "Name, Price, and Category are required." });
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
      toast({ title: "Item Updated" });
    } else {
      setProducts(prev => [newProduct, ...prev]);
      toast({ title: "New Item Added" });
    }
    resetForm();
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
  };

  const deleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this dish?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Item Removed" });
    }
  };

  const addCategory = () => {
    if (!newCategory.name) return;
    const slug = newCategory.name.toLowerCase().replace(/\s+/g, '-');
    setCategories(prev => [...prev, { id: Date.now().toString(), name: newCategory.name, slug }]);
    setNewCategory({ name: '', slug: '' });
    toast({ title: "Category Added" });
  };

  const deleteCategory = (id: string) => {
    if (confirm('Delete this category?')) {
      setCategories(prev => prev.filter(c => c.id !== id));
      toast({ title: "Category Removed" });
    }
  };

  const deleteReview = (index: number) => {
    if (confirm('Remove this customer feedback?')) {
      setReviews(prev => prev.filter((_, i) => i !== index));
      toast({ title: "Review Deleted" });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFFBEB] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
        <Card className="w-full max-w-md rounded-[3rem] shadow-2xl border-amber-500/20 glass-card bg-slate-900/95 backdrop-blur-2xl">
          <CardHeader className="text-center pt-10">
            <div className="h-20 w-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
              <Lock className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-black uppercase italic tracking-tighter text-white">Admin Terminal</CardTitle>
            <p className="text-xs font-bold text-amber-500 uppercase tracking-[0.3em] mt-2">Executive Access Only</p>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Username</Label>
                <Input 
                  type="text" 
                  value={loginForm.username} 
                  onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))}
                  className="h-14 rounded-2xl border-white/10 font-bold bg-slate-800 text-white focus:border-amber-500 transition-all placeholder:text-gray-500"
                  placeholder="Ali@AngryChickZ"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</Label>
                <Input 
                  type="password" 
                  value={loginForm.password} 
                  onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                  className="h-14 rounded-2xl border-white/10 font-bold bg-slate-800 text-white focus:border-amber-500 transition-all placeholder:text-gray-500"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase italic text-lg shadow-lg mt-4 text-white">
                Authenticate
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] p-8 md:p-16 relative overflow-hidden text-white selection:bg-amber-500 selection:text-black">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(225,29,72,0.1),transparent_50%)]" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-amber-500 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-amber-500/20">
              <ShieldCheck className="h-8 w-8 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">Command Center</h1>
              <p className="text-amber-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Executive Menu Management</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/">
              <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 hover:bg-white/5 text-[11px] font-black uppercase tracking-widest gap-3 text-white">
                <ArrowLeft className="h-4 w-4" /> Live Site
              </Button>
            </Link>
            <Button variant="ghost" onClick={() => setIsAuthenticated(false)} className="h-14 px-8 rounded-2xl text-red-500 hover:bg-red-500/10 font-black uppercase tracking-widest gap-3">
              <LogOut className="h-4 w-4" /> Exit
            </Button>
          </div>
        </header>

        <Tabs defaultValue="products" className="space-y-12">
          <TabsList className="bg-slate-900/50 p-2 rounded-[2rem] h-20 gap-2 border border-white/5 w-full md:w-auto backdrop-blur-xl">
            {[
              { value: 'products', icon: Utensils, label: 'Menu' },
              { value: 'storefront', icon: ImageIcon, label: 'Visuals' },
              { value: 'storeinfo', icon: Globe, label: 'Store Info' },
              { value: 'categories', icon: List, label: 'Sectors' },
              { value: 'reviews', icon: MessageSquare, label: 'Reviews' },
            ].map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="flex-1 md:flex-none px-8 rounded-full h-full font-black uppercase italic tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-400 text-[10px] transition-all"
              >
                <tab.icon className="h-4 w-4 mr-2" /> {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* MENU MANAGEMENT */}
          <TabsContent value="products" className="grid lg:grid-cols-12 gap-12 outline-none">
            <Card className="lg:col-span-5 bg-slate-900/80 backdrop-blur-2xl rounded-[3.5rem] border-white/10 shadow-2xl p-4 overflow-hidden">
              <CardHeader className="p-8 border-b border-white/5">
                <CardTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-amber-500">
                  {isEditing ? <Edit2 className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                  {isEditing ? 'Modify Dish' : 'Add New Dish'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Dish Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} 
                    className="bg-slate-800 border-white/5 rounded-2xl h-14 font-bold text-white focus:border-amber-500 transition-all placeholder:text-gray-600"
                    placeholder="e.g. The Angry Inferno"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Description</Label>
                  <Textarea 
                    value={formData.description} 
                    onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} 
                    className="bg-slate-800 border-white/5 rounded-2xl min-h-[120px] font-bold text-white focus:border-amber-500 transition-all placeholder:text-gray-600"
                    placeholder="Describe the flavors and ingredients..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Price ($)</Label>
                    <Input 
                      type="number" 
                      value={formData.price} 
                      onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} 
                      className="bg-slate-800 border-white/5 rounded-2xl h-14 font-bold text-white focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</Label>
                    <select 
                      className="w-full h-14 px-4 bg-slate-800 border border-white/5 rounded-2xl outline-none font-bold text-sm text-white focus:border-amber-500"
                      value={formData.category}
                      onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    >
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Dish Photography</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {formData.imageUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-inner group border border-white/5">
                        <Image src={url} alt="preview" fill className="object-cover" />
                        <button 
                          onClick={() => setFormData(f => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }))}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square flex flex-col items-center justify-center bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-700 transition-all border-2 border-dashed border-white/10 group">
                      {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-amber-500" /> : <Upload className="h-6 w-6 text-gray-500 group-hover:text-amber-500" />}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'product')} disabled={isUploading} />
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleSaveProduct} className="flex-grow h-16 bg-amber-500 hover:bg-amber-600 text-black rounded-2xl font-black uppercase italic shadow-lg text-lg">
                    {isEditing ? 'Update Entry' : 'Add to Menu'}
                  </Button>
                  {isEditing && (
                    <Button variant="ghost" onClick={resetForm} className="h-16 rounded-2xl border border-white/5 px-6 text-gray-500 hover:text-white">
                      <X className="h-6 w-6" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-white">
                  <LayoutGrid className="h-8 w-8 text-amber-500" /> Live Inventory
                </h2>
                <Badge className="bg-slate-800 text-amber-500 border-white/5 px-4 py-1">{products.length} Dishes</Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-slate-900/50 backdrop-blur-xl p-5 rounded-[2.5rem] flex gap-6 items-center group border border-white/5 hover:border-amber-500/30 transition-all">
                    <div className="relative h-28 w-28 rounded-[2rem] overflow-hidden flex-shrink-0 shadow-lg bg-slate-800 border border-white/5">
                      <Image src={product.imageUrls[0] || 'https://picsum.photos/seed/food/200/200'} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-black text-lg leading-tight mb-1 uppercase italic tracking-tighter text-white">{product.name}</h4>
                        <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">{product.category}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="font-black text-xl text-white italic tracking-tighter">${product.price.toFixed(2)}</span>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 text-white" onClick={() => startEdit(product)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all" onClick={() => deleteProduct(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* VISUALS TAB */}
          <TabsContent value="storefront" className="max-w-4xl mx-auto space-y-12 outline-none">
            <Card className="bg-slate-900/80 backdrop-blur-2xl rounded-[3.5rem] p-8 border-white/10 shadow-2xl">
              <CardHeader className="px-0 pt-0 pb-10 border-b border-white/5">
                <CardTitle className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-amber-500">
                  <ImageIcon className="h-8 w-8" /> Visual Presence
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 py-10 space-y-12">
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Main Hero Background</Label>
                    <div className="relative h-48 w-full rounded-[2.5rem] overflow-hidden border-2 border-dashed border-white/10 bg-slate-800 group transition-all hover:border-amber-500/50">
                      <Image src={heroSettings.bgImage} alt="hero-bg" fill className="object-cover transition-transform group-hover:scale-105" />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="h-8 w-8 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'heroBg')} />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Promo Banner Image</Label>
                    <div className="relative h-48 w-full rounded-[2.5rem] overflow-hidden border-2 border-dashed border-white/10 bg-slate-800 group transition-all hover:border-amber-500/50">
                      <Image src={heroSettings.bannerImage} alt="hero-banner" fill className="object-cover transition-transform group-hover:scale-105" />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="h-8 w-8 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'heroBanner')} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Promo Headline</Label>
                    <Input 
                      value={heroSettings.bannerHeadline} 
                      onChange={e => setHeroSettings(p => ({ ...p, bannerHeadline: e.target.value }))}
                      className="bg-slate-800 border-white/5 rounded-2xl h-14 font-black uppercase italic tracking-tighter text-white focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Promo Subtext</Label>
                    <Input 
                      value={heroSettings.bannerText} 
                      onChange={e => setHeroSettings(p => ({ ...p, bannerText: e.target.value }))}
                      className="bg-slate-800 border-white/5 rounded-2xl h-14 font-bold text-white focus:border-amber-500"
                    />
                  </div>
                </div>
                <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-amber-500 text-center flex items-center justify-center gap-3">
                  <Save className="h-4 w-4" /> Changes sync automatically in real-time.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STORE INFO TAB */}
          <TabsContent value="storeinfo" className="max-w-4xl mx-auto space-y-12 outline-none">
            <Card className="bg-slate-900/80 backdrop-blur-2xl rounded-[3.5rem] p-8 border-white/10 shadow-2xl">
              <CardHeader className="px-0 pt-0 pb-10 border-b border-white/5">
                <CardTitle className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-amber-500">
                  <Globe className="h-8 w-8" /> Digital Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 py-10 space-y-12">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Public Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                      <Input 
                        value={storeSettings.phone} 
                        onChange={e => setStoreSettings(p => ({ ...p, phone: e.target.value }))}
                        className="bg-slate-800 border-white/5 rounded-2xl h-14 pl-12 font-bold text-white focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">WhatsApp ID (Digits Only)</Label>
                    <Input 
                      value={storeSettings.whatsappNumber} 
                      onChange={e => setStoreSettings(p => ({ ...p, whatsappNumber: e.target.value }))}
                      className="bg-slate-800 border-white/5 rounded-2xl h-14 font-bold text-white focus:border-amber-500"
                      placeholder="e.g. 70105152"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Physical Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-4 w-4 text-amber-500" />
                    <Textarea 
                      value={storeSettings.address} 
                      onChange={e => setStoreSettings(p => ({ ...p, address: e.target.value }))}
                      className="bg-slate-800 border-white/5 rounded-2xl min-h-[100px] pl-12 font-bold text-white focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 pt-6">
                  {['instagram', 'facebook', 'tiktok'].map((platform) => (
                    <div key={platform} className="space-y-3">
                      <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{platform} URL</Label>
                      <Input 
                        value={storeSettings[platform as keyof StoreSettings] as string} 
                        onChange={e => setStoreSettings(p => ({ ...p, [platform]: e.target.value }))}
                        className="bg-slate-800 border-white/5 rounded-2xl h-14 font-bold text-white focus:border-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CATEGORIES TAB */}
          <TabsContent value="categories" className="max-w-2xl mx-auto space-y-12 outline-none">
            <Card className="bg-slate-900/80 backdrop-blur-2xl rounded-[3rem] p-4 border-white/10 shadow-2xl">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-black uppercase italic tracking-tighter text-white">Menu Sectors</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex gap-4">
                  <Input 
                    placeholder="Sector Name (e.g. Dessert)" 
                    value={newCategory.name} 
                    onChange={e => setNewCategory(c => ({ ...c, name: e.target.value }))}
                    className="h-14 bg-slate-800 border-white/5 rounded-2xl font-bold text-white focus:border-amber-500"
                  />
                  <Button onClick={addCategory} className="h-14 w-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black shadow-lg p-0">
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
                <div className="grid gap-3">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-5 bg-slate-800/50 border border-white/5 rounded-2xl hover:border-amber-500/30 transition-all">
                      <span className="font-black uppercase tracking-widest text-xs text-white">{cat.name}</span>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-red-500 hover:bg-red-500/10" onClick={() => deleteCategory(cat.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REVIEWS TAB */}
          <TabsContent value="reviews" className="space-y-12 outline-none">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-white">
                <MessageSquare className="h-8 w-8 text-amber-500" /> Customer Sentiment
              </h2>
              <Badge className="bg-amber-500 text-black px-4 py-1 font-black">{reviews.length} Feedbacks</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review, idx) => (
                <Card key={idx} className="rounded-[3rem] border-white/5 bg-slate-900/50 backdrop-blur-2xl p-8 group relative hover:border-amber-500/20 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-black uppercase italic tracking-tighter text-lg text-white">{review.customerName}</h4>
                      <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Date Unknown'}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`h-4 w-4 ${i <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-white/10'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-400 leading-relaxed italic">"{review.comment}"</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10"
                    onClick={() => deleteReview(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
              {reviews.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                  <p className="text-gray-500 uppercase font-black tracking-widest">No reviews logged yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
