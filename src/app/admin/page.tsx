'use client';

import { useState, useEffect } from 'react';
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
  ImageIcon, 
  Globe, 
  X,
  Palette
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
    phone: '',
    address: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    whatsappNumber: '',
    openingHours: ''
  });
  const [heroSettings, setHeroSettings] = useState({
    bgImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1600&auto=format&fit=crop',
    bannerHeadline: 'LEVEL 5 HEAT',
    bannerText: 'Elite Signature Release'
  });
  const [adminLogo, setAdminLogo] = useState<string | null>(null);

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
    const savedLogo = localStorage.getItem('angry_chickz_logo');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCats) setCategories(JSON.parse(savedCats));
    if (savedReviews) setReviews(JSON.parse(savedReviews));
    if (savedStore) setStoreSettings(JSON.parse(savedStore));
    if (savedHero) setHeroSettings(JSON.parse(savedHero));
    if (savedLogo) setAdminLogo(savedLogo);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('angry_chickz_products', JSON.stringify(products));
      localStorage.setItem('angry_chickz_categories', JSON.stringify(categories));
      localStorage.setItem('angry_chickz_reviews', JSON.stringify(reviews));
      localStorage.setItem('angry_chickz_store_settings', JSON.stringify(storeSettings));
      localStorage.setItem('angry_chickz_hero_settings', JSON.stringify(heroSettings));
      if (adminLogo) localStorage.setItem('angry_chickz_logo', adminLogo);
    }
  }, [products, categories, reviews, storeSettings, heroSettings, adminLogo, isAuthenticated]);

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
      toast({ title: "Authorized", description: "Welcome back, Ali." });
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "Invalid credentials." });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'heroBg' | 'heroBanner' | 'logo') => {
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
      } else if (target === 'logo') {
        setAdminLogo(base64);
      }
      setIsUploading(false);
      toast({ title: "Upload Success" });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast({ variant: "destructive", title: "Required", description: "Missing essential info." });
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
    toast({ title: "Saved" });
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
    if (confirm('Delete permanently?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const addCategory = () => {
    if (!newCategory.name) return;
    const slug = newCategory.name.toLowerCase().replace(/\s+/g, '-');
    setCategories(prev => [...prev, { id: Date.now().toString(), name: newCategory.name, slug }]);
    setNewCategory({ name: '', slug: '' });
  };

  const deleteCategory = (id: string) => {
    if (confirm('Delete category?')) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center pt-8 pb-2">
            <div className="h-16 w-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-zinc-950" />
            </div>
            <CardTitle className="text-xl font-bold text-zinc-100 uppercase tracking-widest">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-500 uppercase">Username</Label>
                <Input 
                  value={loginForm.username} 
                  onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-12 focus:ring-amber-500/50"
                  placeholder="Username"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-500 uppercase">Password</Label>
                <Input 
                  type="password" 
                  value={loginForm.password} 
                  onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-12 focus:ring-amber-500/50"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl uppercase tracking-widest transition-all">
                Login Terminal
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <div className="container mx-auto max-w-6xl p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-zinc-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Admin Terminal</h1>
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Session Active: Ali</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Store
            </Button>
          </Link>
        </header>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl h-auto w-full overflow-x-auto no-scrollbar justify-start">
            {[
              { value: 'products', icon: Utensils, label: 'Items' },
              { value: 'categories', icon: List, label: 'Categories' },
              { value: 'visuals', icon: ImageIcon, label: 'Store Visuals' },
              { value: 'assets', icon: Palette, label: 'Brand Assets' },
              { value: 'storeinfo', icon: Globe, label: 'Store Info' },
              { value: 'reviews', icon: MessageSquare, label: 'Reviews' },
            ].map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950 text-zinc-500 transition-all whitespace-nowrap"
              >
                <tab.icon className="h-4 w-4 mr-2" /> {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="products" className="grid lg:grid-cols-12 gap-8 outline-none animate-in fade-in duration-500">
            <Card className="lg:col-span-5 bg-zinc-900 border-zinc-800 rounded-2xl shadow-xl h-fit sticky top-24">
              <CardHeader className="border-b border-zinc-800">
                <CardTitle className="text-lg font-bold flex items-center gap-3">
                  {isEditing ? <Edit2 className="h-5 w-5 text-amber-500" /> : <Plus className="h-5 w-5 text-amber-500" />}
                  {isEditing ? 'Update Item' : 'Add New Item'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase">Item Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} 
                    className="bg-zinc-800 border-zinc-700 rounded-xl text-white focus:ring-amber-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase">Description</Label>
                  <Textarea 
                    value={formData.description} 
                    onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} 
                    className="bg-zinc-800 border-zinc-700 rounded-xl min-h-[80px] text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Price ($)</Label>
                    <Input 
                      type="number" 
                      value={formData.price} 
                      onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} 
                      className="bg-zinc-800 border-zinc-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Category</Label>
                    <select 
                      className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white"
                      value={formData.category}
                      onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    >
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase">Photo</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.imageUrls.map((url, i) => (
                      <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden border border-zinc-700 group">
                        <Image src={url} alt="preview" fill className="object-cover" />
                        <button onClick={() => setFormData(f => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }))} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                    <label className="h-16 w-16 flex flex-col items-center justify-center bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-amber-500 transition-all">
                      {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5 text-zinc-500" />}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'product')} />
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveProduct} className="flex-grow bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl uppercase tracking-widest text-xs h-11 transition-all">
                    Save Item
                  </Button>
                  {isEditing && (
                    <Button variant="ghost" onClick={resetForm} className="bg-zinc-800 hover:bg-zinc-700 rounded-xl h-11 w-11 p-0">
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-3">
                  <LayoutGrid className="h-5 w-5 text-amber-500" /> Live Catalog
                </h2>
                <Badge className="bg-zinc-900 border-zinc-800 text-amber-500 px-4 py-1">{products.length} items</Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex gap-4 items-center hover:border-amber-500/50 transition-all group">
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800">
                      <Image src={product.imageUrls[0] || 'https://picsum.photos/seed/food/200/200'} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-zinc-100 truncate text-sm">{product.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-amber-500 text-xs">${product.price.toFixed(2)}</span>
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(product)} className="p-2 text-zinc-500 hover:text-white transition-colors"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => deleteProduct(product.id)} className="p-2 text-zinc-500 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="max-w-xl mx-auto space-y-6 outline-none animate-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-zinc-900 border-zinc-800 rounded-2xl p-6 shadow-xl">
              <CardHeader className="px-0 pt-0 border-b border-zinc-800 mb-6 pb-4">
                <CardTitle className="text-lg font-bold text-amber-500">Menu Categories</CardTitle>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Add sections like Burgers, Drinks, etc.</p>
              </CardHeader>
              <div className="space-y-6">
                <div className="flex gap-3">
                  <Input 
                    placeholder="New Category Name..." 
                    value={newCategory.name} 
                    onChange={e => setNewCategory(c => ({ ...c, name: e.target.value }))}
                    className="bg-zinc-800 border-zinc-700 text-white rounded-xl focus:ring-amber-500/50"
                  />
                  <Button onClick={addCategory} className="bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl font-bold px-6">
                    Add
                  </Button>
                </div>
                <div className="grid gap-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-800 rounded-xl group hover:border-amber-500/30 transition-all">
                      <span className="font-bold text-sm">{cat.name}</span>
                      <button onClick={() => deleteCategory(cat.id)} className="text-zinc-500 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="visuals" className="max-w-4xl mx-auto space-y-6 outline-none animate-in fade-in duration-500">
            <Card className="bg-zinc-900 border-zinc-800 rounded-2xl p-6 shadow-xl">
              <CardHeader className="px-0 pt-0 border-b border-zinc-800 mb-6 pb-4">
                <CardTitle className="text-lg font-bold text-amber-500">Store Visuals</CardTitle>
              </CardHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase">Hero Background</Label>
                  <div className="relative h-48 rounded-xl overflow-hidden border-2 border-dashed border-zinc-800 group transition-all hover:border-amber-500/50">
                    <Image src={heroSettings.bgImage} alt="hero" fill className="object-cover" />
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                      <Upload className="h-6 w-6 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'heroBg')} />
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase">Promo Banner</Label>
                  <div className="relative h-48 rounded-xl overflow-hidden border-2 border-dashed border-zinc-800 group transition-all hover:border-amber-500/50">
                    <Image src={heroSettings.bannerImage} alt="banner" fill className="object-cover" />
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                      <Upload className="h-6 w-6 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'heroBanner')} />
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="max-w-xl mx-auto outline-none animate-in fade-in duration-500">
             <Card className="bg-zinc-900 border-zinc-800 rounded-2xl p-6 shadow-xl">
                <CardHeader className="px-0 pt-0 border-b border-zinc-800 mb-6 pb-4">
                  <CardTitle className="text-lg font-bold text-amber-500">Brand Assets</CardTitle>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Manage your official logo.</p>
                </CardHeader>
                <div className="space-y-6">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase">Official Logo</Label>
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative h-32 w-32 rounded-2xl bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden group hover:border-amber-500/50 transition-all">
                      {adminLogo ? (
                        <img src={adminLogo} alt="Logo Preview" className="h-full w-full object-contain p-4" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-zinc-600" />
                      )}
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                        <Upload className="h-6 w-6 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
                      </label>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase text-center max-w-xs leading-relaxed">
                      Upload your high-res logo. It will be displayed in the site header and PWA splash screen.
                    </p>
                  </div>
                </div>
             </Card>
          </TabsContent>
          
          <TabsContent value="storeinfo" className="max-w-2xl mx-auto outline-none animate-in fade-in duration-500">
             <Card className="bg-zinc-900 border-zinc-800 rounded-2xl p-6 shadow-xl">
                <CardHeader className="px-0 pt-0 border-b border-zinc-800 mb-6 pb-4">
                  <CardTitle className="text-lg font-bold text-amber-500">Store Settings</CardTitle>
                </CardHeader>
                <div className="grid md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">WhatsApp Number</Label>
                    <Input value={storeSettings.whatsappNumber} onChange={e => setStoreSettings(s => ({ ...s, whatsappNumber: e.target.value }))} className="bg-zinc-800 border-zinc-700 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Contact Phone</Label>
                    <Input value={storeSettings.phone} onChange={e => setStoreSettings(s => ({ ...s, phone: e.target.value }))} className="bg-zinc-800 border-zinc-700 rounded-xl" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Address</Label>
                    <Input value={storeSettings.address} onChange={e => setStoreSettings(s => ({ ...s, address: e.target.value }))} className="bg-zinc-800 border-zinc-700 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Instagram Link</Label>
                    <Input value={storeSettings.instagram} onChange={e => setStoreSettings(s => ({ ...s, instagram: e.target.value }))} className="bg-zinc-800 border-zinc-700 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Facebook Link</Label>
                    <Input value={storeSettings.facebook} onChange={e => setStoreSettings(s => ({ ...s, facebook: e.target.value }))} className="bg-zinc-800 border-zinc-700 rounded-xl" />
                  </div>
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="reviews" className="outline-none animate-in fade-in duration-500">
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((r, i) => (
                  <Card key={i} className="bg-zinc-900 border-zinc-800 p-6 rounded-2xl shadow-lg hover:border-amber-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <h5 className="font-bold text-sm text-white">{r.customerName}</h5>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, idx) => <Star key={idx} className={`h-3 w-3 ${idx < r.rating ? 'text-amber-500 fill-amber-500' : 'text-zinc-800'}`} />)}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed italic">&quot;{r.comment}&quot;</p>
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                       <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </Card>
                ))}
                {reviews.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                    No customer sentiment logged yet.
                  </div>
                )}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}