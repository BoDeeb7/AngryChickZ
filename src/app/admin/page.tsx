
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
  Lock, 
  ImageIcon, 
  Globe, 
  X,
  Save,
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
import { Product, Category, StoreSettings } from '@/types/restaurant';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  // COMPLETELY INDEPENDENT LOADING STATES
  const [isProductSaving, setIsProductSaving] = useState(false);
  const [isCategoryAdding, setIsCategoryAdding] = useState(false);
  const [isVisualsSaving, setIsVisualsSaving] = useState(false);
  const [isStoreInfoSaving, setIsStoreInfoSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const { toast } = useToast();
  const db = useFirestore();

  // STABLE Firestore Queries & Refs
  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db]);

  const categoriesRef = useMemo(() => db ? collection(db, 'categories') : null, [db]);
  const storeRef = useMemo(() => db ? doc(db, 'settings', 'store') : null, [db]);
  const heroRef = useMemo(() => db ? doc(db, 'settings', 'hero') : null, [db]);

  const { data: products = [] } = useCollection<Product>(productsQuery);
  const { data: categories = [] } = useCollection<Category>(categoriesRef);
  const { data: storeSettings } = useDoc<StoreSettings>(storeRef);
  const { data: heroSettings } = useDoc<any>(heroRef);

  const [localStoreSettings, setLocalStoreSettings] = useState<any>({});
  const [localHeroSettings, setLocalHeroSettings] = useState<any>({});
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrls: [] as string[],
    badges: [] as string[],
  });
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (storeSettings) setLocalStoreSettings(storeSettings);
  }, [storeSettings]);

  useEffect(() => {
    if (heroSettings) setLocalHeroSettings(heroSettings);
  }, [heroSettings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    // Simple mock auth for prototype
    if (loginForm.username === 'Ali@AngryChickZ' && loginForm.password === 'AngryChickZ@DeebData#79') {
      setIsAuthenticated(true);
      toast({ title: "Authorized", description: "Welcome back, Ali." });
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "Invalid credentials." });
    }
    setIsLoginLoading(false);
  };

  const resetForm = useCallback(() => {
    setFormData({ name: '', description: '', price: '', category: '', imageUrls: [], badges: [] });
    setIsEditing(null);
  }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category || !db) {
      toast({ variant: "destructive", title: "Required", description: "Please fill essential fields." });
      return;
    }

    setIsProductSaving(true);
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrls: formData.imageUrls,
        badges: formData.badges,
        createdAt: isEditing ? (products.find(p => p.id === isEditing)?.createdAt || serverTimestamp()) : serverTimestamp()
      };

      if (isEditing) {
        setDoc(doc(db, 'products', isEditing), productData, { merge: true })
          .then(() => {
            toast({ title: "Updated", description: "Product has been updated successfully." });
            resetForm();
          })
          .catch((err) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `products/${isEditing}`, operation: 'update', requestResourceData: productData }));
          })
          .finally(() => setIsProductSaving(false));
      } else {
        addDoc(collection(db, 'products'), productData)
          .then(() => {
            toast({ title: "Created", description: "New product added to menu." });
            resetForm();
          })
          .catch((err) => {
             errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'products', operation: 'create', requestResourceData: productData }));
          })
          .finally(() => setIsProductSaving(false));
      }
    } catch (err: any) {
      setIsProductSaving(false);
      toast({ variant: "destructive", title: "Form Error", description: err.message });
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName || !db) return;
    
    setIsCategoryAdding(true);
    try {
      const slug = newCategoryName.toLowerCase().trim().replace(/\s+/g, '-');
      const catData = { name: newCategoryName.trim(), slug };
      
      addDoc(collection(db, 'categories'), catData)
        .then(() => {
          setNewCategoryName('');
          toast({ title: "Category Added", description: `"${catData.name}" is now available.` });
        })
        .catch((err) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'categories', operation: 'create', requestResourceData: catData }));
        })
        .finally(() => setIsCategoryAdding(false));
    } catch (err: any) {
      setIsCategoryAdding(false);
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'heroBg' | 'heroBanner' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (target === 'product') {
        setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, base64] }));
        setIsUploading(false);
      } else if (db) {
        const docRef = target === 'logo' ? doc(db, 'settings', 'store') : doc(db, 'settings', 'hero');
        const updateData = target === 'heroBg' ? { bgImage: base64 } : target === 'heroBanner' ? { bannerImage: base64 } : { logo: base64 };
        
        setDoc(docRef, updateData, { merge: true })
          .then(() => toast({ title: "Visual Updated", description: "Changes reflected instantly." }))
          .catch((err) => {
             errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: updateData }));
          })
          .finally(() => setIsUploading(false));
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast({ variant: "destructive", title: "Error", description: "Failed to read file." });
    };
    reader.readAsDataURL(file);
  };

  const deleteProduct = (id: string) => {
    if (!db || !confirm('Permanently delete this item?')) return;
    deleteDoc(doc(db, 'products', id))
      .then(() => toast({ title: "Deleted", description: "Item removed from menu." }))
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `products/${id}`, operation: 'delete' }));
      });
  };

  const deleteCategory = (id: string) => {
    if (!db || !confirm('Remove this category?')) return;
    deleteDoc(doc(db, 'categories', id))
      .then(() => toast({ title: "Category Removed" }))
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `categories/${id}`, operation: 'delete' }));
      });
  };

  const saveSettings = (target: 'store' | 'hero') => {
    if (!db) return;
    
    if (target === 'store') setIsStoreInfoSaving(true);
    if (target === 'hero') setIsVisualsSaving(true);

    const data = target === 'store' ? localStoreSettings : localHeroSettings;
    
    setDoc(doc(db, 'settings', target), data, { merge: true })
      .then(() => {
        toast({ title: "Synced", description: `${target === 'store' ? 'Store' : 'Visual'} settings pushed to cloud.` });
      })
      .catch((err) => {
         errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `settings/${target}`, operation: 'update', requestResourceData: data }));
      })
      .finally(() => {
        if (target === 'store') setIsStoreInfoSaving(false);
        if (target === 'hero') setIsVisualsSaving(false);
      });
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
                  className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-12"
                  placeholder="Username"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-500 uppercase">Password</Label>
                <Input 
                  type="password" 
                  value={loginForm.password} 
                  onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-12"
                  placeholder="••••••••"
                />
              </div>
              <Button disabled={isLoginLoading} type="submit" className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl uppercase tracking-widest">
                {isLoginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Login Terminal'}
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
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Realtime Cloud Enabled</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" /> View Site
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
            <TabsTrigger value="storeinfo" className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950 text-zinc-500">
              <Globe className="h-4 w-4 mr-2" /> Store Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="grid lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-5 bg-zinc-900 border-zinc-800 rounded-2xl shadow-xl h-fit">
              <CardHeader className="border-b border-zinc-800">
                <CardTitle className="text-lg font-bold flex items-center gap-3 text-amber-500 uppercase tracking-tighter italic">
                  {isEditing ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {isEditing ? 'Edit Item' : 'New Item'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Item Name</Label>
                    <Input required value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="bg-zinc-800 border-zinc-700 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Description</Label>
                    <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} className="bg-zinc-800 border-zinc-700 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-zinc-500 uppercase">Price ($)</Label>
                      <Input required type="number" step="0.01" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} className="bg-zinc-800 border-zinc-700 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-zinc-500 uppercase">Category</Label>
                      <select 
                        required 
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
                          <button type="button" onClick={() => setFormData(f => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }))} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4 text-white" /></button>
                        </div>
                      ))}
                      <label className="h-16 w-16 flex flex-col items-center justify-center bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-amber-500 transition-colors">
                        {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5 text-zinc-500" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'product')} />
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button disabled={isProductSaving} type="submit" className="flex-grow bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl uppercase tracking-widest text-xs h-11">
                      {isProductSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {isEditing ? 'Update Item' : 'Save Item'}
                    </Button>
                    {isEditing && (
                      <Button type="button" variant="ghost" onClick={resetForm} className="bg-zinc-800 hover:bg-zinc-700 rounded-xl h-11 w-11 p-0">
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-3 text-amber-500 italic uppercase">
                  <LayoutGrid className="h-5 w-5" /> Active Menu
                </h2>
                <Badge className="bg-zinc-900 border-zinc-800 text-amber-500 px-4 py-1 font-black">{products.length} ITEMS</Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex gap-4 items-center group hover:border-amber-500/50 transition-all">
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800 shadow-lg">
                      <Image src={product.imageUrls?.[0] || 'https://picsum.photos/seed/food/200/200'} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-zinc-100 truncate text-sm uppercase italic">{product.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-amber-500 text-xs">${product.price.toFixed(2)}</span>
                        <div className="flex gap-1">
                          <button onClick={() => { 
                            setFormData({ 
                              name: product.name, 
                              description: product.description, 
                              price: product.price.toString(), 
                              category: product.category, 
                              imageUrls: product.imageUrls || [], 
                              badges: product.badges || [] 
                            }); 
                            setIsEditing(product.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }} className="p-2 text-zinc-500 hover:text-white"><Edit2 className="h-4 w-4" /></button>
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
                <CardTitle className="text-lg font-bold text-amber-500 italic uppercase">Manage Sections</CardTitle>
              </CardHeader>
              <div className="space-y-6">
                <form onSubmit={addCategory} className="flex gap-3">
                  <Input 
                    required 
                    placeholder="New Section Title" 
                    value={newCategoryName} 
                    onChange={e => setNewCategoryName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 h-12 rounded-xl"
                  />
                  <Button disabled={isCategoryAdding || !newCategoryName} type="submit" className="bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl font-bold px-8 h-12 uppercase italic tracking-widest text-xs">
                    {isCategoryAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                  </Button>
                </form>
                <div className="grid gap-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-800 rounded-xl hover:border-amber-500/30 transition-all">
                      <span className="font-bold text-sm uppercase italic text-zinc-300">{cat.name}</span>
                      <button onClick={() => deleteCategory(cat.id)} className="text-zinc-500 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="visuals" className="max-w-4xl mx-auto space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 rounded-2xl p-6 shadow-xl">
              <CardHeader className="px-0 pt-0 border-b border-zinc-800 mb-6 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold text-amber-500 italic uppercase">Digital Visuals</CardTitle>
                <Button disabled={isVisualsSaving} onClick={() => saveSettings('hero')} size="sm" className="bg-amber-500 text-zinc-950 font-bold gap-2 rounded-xl h-10 px-6 uppercase italic text-[10px] tracking-widest">
                  {isVisualsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Sync Hero
                </Button>
              </CardHeader>
              <div className="space-y-6 pt-4">
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-zinc-500 uppercase">Banner Headline</Label>
                      <Input value={localHeroSettings?.bannerHeadline || ''} onChange={e => setLocalHeroSettings((p: any) => ({ ...p, bannerHeadline: e.target.value }))} className="bg-zinc-800 border-zinc-700" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-zinc-500 uppercase">Banner Subtext</Label>
                      <Input value={localHeroSettings?.bannerText || ''} onChange={e => setLocalHeroSettings((p: any) => ({ ...p, bannerText: e.target.value }))} className="bg-zinc-800 border-zinc-700" />
                    </div>
                 </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Logo Brand Mark</Label>
                    <div className="relative h-32 w-32 rounded-2xl bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden group mx-auto md:mx-0">
                      {localStoreSettings?.logo ? (
                        <img src={localStoreSettings.logo} alt="Logo" className="h-full w-full object-contain p-4" />
                      ) : (
                        <Utensils className="h-8 w-8 text-zinc-600" />
                      )}
                      <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                        {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <Upload className="h-6 w-6 text-white" />}
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Hero Background</Label>
                    <div className="relative h-48 rounded-xl overflow-hidden border border-zinc-800 group shadow-2xl">
                      <Image src={localHeroSettings?.bgImage || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1600&auto=format&fit=crop'} alt="bg" fill className="object-cover" />
                      <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                        <Upload className="h-6 w-6 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'heroBg')} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="storeinfo" className="max-w-2xl mx-auto">
             <Card className="bg-zinc-900 border-zinc-800 rounded-2xl p-6 shadow-xl">
                <CardHeader className="px-0 pt-0 border-b border-zinc-800 mb-6 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-bold text-amber-500 italic uppercase">Cloud Contact Info</CardTitle>
                  <Button disabled={isStoreInfoSaving} onClick={() => saveSettings('store')} size="sm" className="bg-amber-500 text-zinc-950 font-bold gap-2 rounded-xl h-10 px-6 uppercase italic text-[10px] tracking-widest">
                    {isStoreInfoSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update
                  </Button>
                </CardHeader>
                <div className="grid md:grid-cols-2 gap-6 pt-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">WhatsApp (International)</Label>
                    <Input value={localStoreSettings?.whatsappNumber || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, whatsappNumber: e.target.value }))} className="bg-zinc-800 border-zinc-700" placeholder="e.g. 96170105152" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Landline/Mobile</Label>
                    <Input value={localStoreSettings?.phone || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, phone: e.target.value }))} className="bg-zinc-800 border-zinc-700" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Physical Address</Label>
                    <Input value={localStoreSettings?.address || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, address: e.target.value }))} className="bg-zinc-800 border-zinc-700" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Instagram Link</Label>
                    <Input value={localStoreSettings?.instagram || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, instagram: e.target.value }))} className="bg-zinc-800 border-zinc-700" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">TikTok Link</Label>
                    <Input value={localStoreSettings?.tiktok || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, tiktok: e.target.value }))} className="bg-zinc-800 border-zinc-700" />
                  </div>
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
