
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
  Palette,
  Save
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
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const db = useFirestore();

  // STABLE Firestore References
  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db]);

  const categoriesRef = useMemo(() => {
    if (!db) return null;
    return collection(db, 'categories');
  }, [db]);

  const storeRef = useMemo(() => {
    if (!db) return null;
    return doc(db, 'settings', 'store');
  }, [db]);

  const heroRef = useMemo(() => {
    if (!db) return null;
    return doc(db, 'settings', 'hero');
  }, [db]);

  const { data: products = [] } = useCollection<Product>(productsQuery);
  const { data: categories = [] } = useCollection<Category>(categoriesRef);
  const { data: storeSettings } = useDoc<StoreSettings>(storeRef);
  const { data: heroSettings } = useDoc<any>(heroRef);

  const [localStoreSettings, setLocalStoreSettings] = useState<any>({});
  const [localHeroSettings, setLocalHeroSettings] = useState<any>({});

  useEffect(() => {
    if (storeSettings) setLocalStoreSettings(storeSettings);
  }, [storeSettings]);

  useEffect(() => {
    if (heroSettings) setLocalHeroSettings(heroSettings);
  }, [heroSettings]);

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrls: [] as string[],
    badges: [] as string[],
  });

  const [newCategory, setNewCategory] = useState({ name: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'Ali@AngryChickZ' && loginForm.password === 'AngryChickZ@DeebData#79') {
      setIsAuthenticated(true);
      toast({ title: "Authorized", description: "Welcome back, Ali." });
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "Invalid credentials." });
    }
  };

  const resetForm = useCallback(() => {
    setFormData({ name: '', description: '', price: '', category: '', imageUrls: [], badges: [] });
    setIsEditing(null);
  }, []);

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.category || !db) {
      toast({ variant: "destructive", title: "Required", description: "Missing essential info." });
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrls: formData.imageUrls,
        badges: formData.badges,
        createdAt: isEditing ? (products.find(p => p.id === isEditing)?.createdAt || serverTimestamp()) : serverTimestamp()
      };

      if (isEditing) {
        await setDoc(doc(db, 'products', isEditing), productData, { merge: true });
      } else {
        await addDoc(collection(db, 'products'), productData);
      }

      toast({ title: "Product Saved Successfully" });
      resetForm();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Save Failed", description: "Check connection." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCategory = async () => {
    if (!newCategory.name || !db) return;
    setIsSubmitting(true);
    try {
      const slug = newCategory.name.toLowerCase().trim().replace(/\s+/g, '-');
      await addDoc(collection(db, 'categories'), { name: newCategory.name.trim(), slug });
      setNewCategory({ name: '' });
      toast({ title: "Category Added" });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Failed to Add Category" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'heroBg' | 'heroBanner' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSubmitting(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        if (target === 'product') {
          setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, base64] }));
        } else if (db) {
          const docRef = target === 'logo' ? doc(db, 'settings', 'store') : doc(db, 'settings', 'hero');
          const updateData = target === 'heroBg' ? { bgImage: base64 } : target === 'heroBanner' ? { bannerImage: base64 } : { logo: base64 };
          await setDoc(docRef, updateData, { merge: true });
          toast({ title: "Asset Uploaded Successfully" });
        }
      } catch (err) {
        toast({ variant: "destructive", title: "Upload Failed" });
      } finally {
        setIsSubmitting(false);
      }
    };
    reader.onerror = () => setIsSubmitting(false);
    reader.readAsDataURL(file);
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

  const deleteProduct = async (id: string) => {
    if (!db || !confirm('Delete permanently?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "Item Removed Successfully" });
    } catch (err) {
      toast({ variant: "destructive", title: "Delete Failed" });
    }
  };

  const deleteCategory = async (id: string) => {
    if (!db || !confirm('Delete category?')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast({ title: "Category Removed" });
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to Remove" });
    }
  };

  const saveStoreSettings = async () => {
    if (!db || !localStoreSettings) return;
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'settings', 'store'), localStoreSettings, { merge: true });
      toast({ title: "Store Info Updated" });
    } catch (err) {
      toast({ variant: "destructive", title: "Update Failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveHeroSettings = async () => {
    if (!db || !localHeroSettings) return;
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'settings', 'hero'), localHeroSettings, { merge: true });
      toast({ title: "Hero Visuals Synced" });
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsSubmitting(false);
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
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Sync Status: Real-time Cloud</p>
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
            <TabsTrigger value="products" className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950 text-zinc-500">
              <Utensils className="h-4 w-4 mr-2" /> Items
            </TabsTrigger>
            <TabsTrigger value="categories" className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950 text-zinc-500">
              <List className="h-4 w-4 mr-2" /> Categories
            </TabsTrigger>
            <TabsTrigger value="visuals" className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950 text-zinc-500">
              <ImageIcon className="h-4 w-4 mr-2" /> Visuals
            </TabsTrigger>
            <TabsTrigger value="assets" className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950 text-zinc-500">
              <Palette className="h-4 w-4 mr-2" /> Logo
            </TabsTrigger>
            <TabsTrigger value="storeinfo" className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950 text-zinc-500">
              <Globe className="h-4 w-4 mr-2" /> Store Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="grid lg:grid-cols-12 gap-8 outline-none">
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
                    className="bg-zinc-800 border-zinc-700 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase">Description</Label>
                  <Textarea 
                    value={formData.description} 
                    onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} 
                    className="bg-zinc-800 border-zinc-700 rounded-xl min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Price ($)</Label>
                    <Input 
                      type="number" 
                      value={formData.price} 
                      onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} 
                      className="bg-zinc-800 border-zinc-700 rounded-xl"
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
                    <label className="h-16 w-16 flex flex-col items-center justify-center bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-amber-500">
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5 text-zinc-500" />}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'product')} />
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button disabled={isSubmitting} onClick={handleSaveProduct} className="flex-grow bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl uppercase tracking-widest text-xs h-11">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isEditing ? 'Update Item' : 'Save Item'}
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
                  <LayoutGrid className="h-5 w-5 text-amber-500" /> Active Menu
                </h2>
                <Badge className="bg-zinc-900 border-zinc-800 text-amber-500 px-4 py-1">{products.length} Items Synced</Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex gap-4 items-center group">
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800">
                      <Image src={product.imageUrls[0] || 'https://picsum.photos/seed/food/200/200'} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-zinc-100 truncate text-sm">{product.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-amber-500 text-xs">${product.price.toFixed(2)}</span>
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(product)} className="p-2 text-zinc-500 hover:text-white"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => deleteProduct(product.id)} className="p-2 text-zinc-500 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="max-w-xl mx-auto space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 rounded-2xl p-6 shadow-xl">
              <CardHeader className="px-0 pt-0 border-b border-zinc-800 mb-6 pb-4">
                <CardTitle className="text-lg font-bold text-amber-500">Categories</CardTitle>
              </CardHeader>
              <div className="space-y-6">
                <div className="flex gap-3">
                  <Input 
                    placeholder="Category Name" 
                    value={newCategory.name} 
                    onChange={e => setNewCategory({ name: e.target.value })}
                    className="bg-zinc-800 border-zinc-700"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isSubmitting) addCategory();
                    }}
                  />
                  <Button disabled={isSubmitting || !newCategory.name} onClick={addCategory} className="bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl font-bold px-6">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                  </Button>
                </div>
                <div className="grid gap-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-800 rounded-xl">
                      <span className="font-bold text-sm">{cat.name}</span>
                      <button onClick={() => deleteCategory(cat.id)} className="text-zinc-500 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="visuals" className="max-w-4xl mx-auto space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 rounded-2xl p-6 shadow-xl">
              <CardHeader className="px-0 pt-0 border-b border-zinc-800 mb-6 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold text-amber-500">Hero Content</CardTitle>
                <Button disabled={isSubmitting} onClick={saveHeroSettings} size="sm" className="bg-amber-500 text-zinc-950 font-bold gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                </Button>
              </CardHeader>
              <div className="space-y-6">
                 <div className="grid md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-zinc-500 uppercase">Headline</Label>
                      <Input value={localHeroSettings?.bannerHeadline || ''} onChange={e => setLocalHeroSettings((p: any) => ({ ...p, bannerHeadline: e.target.value }))} className="bg-zinc-800 border-zinc-700" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-zinc-500 uppercase">Banner Text</Label>
                      <Input value={localHeroSettings?.bannerText || ''} onChange={e => setLocalHeroSettings((p: any) => ({ ...p, bannerText: e.target.value }))} className="bg-zinc-800 border-zinc-700" />
                    </div>
                 </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Background</Label>
                    <div className="relative h-48 rounded-xl overflow-hidden border border-zinc-800 group">
                      <Image src={localHeroSettings?.bgImage || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1600&auto=format&fit=crop'} alt="hero" fill className="object-cover" />
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer">
                        <Upload className="h-6 w-6 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'heroBg')} />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Promo Image</Label>
                    <div className="relative h-48 rounded-xl overflow-hidden border border-zinc-800 group">
                      <Image src={localHeroSettings?.bannerImage || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1600&auto=format&fit=crop'} alt="banner" fill className="object-cover" />
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer">
                        <Upload className="h-6 w-6 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'heroBanner')} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="max-w-xl mx-auto">
             <Card className="bg-zinc-900 border-zinc-800 rounded-2xl p-6 shadow-xl">
                <CardHeader className="px-0 pt-0 border-b border-zinc-800 mb-6 pb-4">
                  <CardTitle className="text-lg font-bold text-amber-500">Brand Logo</CardTitle>
                </CardHeader>
                <div className="flex flex-col items-center gap-6 py-6">
                    <div className="relative h-32 w-32 rounded-2xl bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden group">
                      {localStoreSettings?.logo ? (
                        <img src={localStoreSettings.logo} alt="Logo" className="h-full w-full object-contain p-4" />
                      ) : (
                        <Utensils className="h-8 w-8 text-zinc-600" />
                      )}
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer">
                        {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <Upload className="h-6 w-6 text-white" />}
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
                      </label>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Supports PNG, JPG (Max 2MB)</p>
                </div>
             </Card>
          </TabsContent>
          
          <TabsContent value="storeinfo" className="max-w-2xl mx-auto">
             <Card className="bg-zinc-900 border-zinc-800 rounded-2xl p-6 shadow-xl">
                <CardHeader className="px-0 pt-0 border-b border-zinc-800 mb-6 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-bold text-amber-500">Contact Details</CardTitle>
                  <Button disabled={isSubmitting} onClick={saveStoreSettings} size="sm" className="bg-amber-500 text-zinc-950 font-bold gap-2">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Sync
                  </Button>
                </CardHeader>
                <div className="grid md:grid-cols-2 gap-6 pt-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">WhatsApp</Label>
                    <input value={localStoreSettings?.whatsappNumber || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, whatsappNumber: e.target.value }))} className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Phone</Label>
                    <input value={localStoreSettings?.phone || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, phone: e.target.value }))} className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Address</Label>
                    <input value={localStoreSettings?.address || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, address: e.target.value }))} className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Instagram</Label>
                    <input value={localStoreSettings?.instagram || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, instagram: e.target.value }))} className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">TikTok</Label>
                    <input value={localStoreSettings?.tiktok || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, tiktok: e.target.value }))} className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm" />
                  </div>
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
