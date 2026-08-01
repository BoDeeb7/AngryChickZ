
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2, 
  Utensils, 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
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
import { Product, Category, StoreSettings } from '@/types/restaurant';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  // SEPARATED LOADING STATES
  const [isProductSaving, setIsProductSaving] = useState(false);
  const [isCategoryAdding, setIsCategoryAdding] = useState(false);
  const [isVisualsSaving, setIsVisualsSaving] = useState(false);
  const [isContactsSaving, setIsContactsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { toast } = useToast();
  const db = useFirestore();

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
    if (loginForm.username === 'Ali@AngryChickZ' && loginForm.password === 'AngryChickZ@DeebData#79') {
      setIsAuthenticated(true);
      toast({ title: "Authorized", description: "Admin terminal accessed." });
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "Invalid credentials." });
    }
  };

  const resetForm = useCallback(() => {
    setFormData({ name: '', description: '', price: '', category: '', imageUrls: [], badges: [] });
    setIsEditing(null);
  }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category || !db || isProductSaving) return;

    setIsProductSaving(true);
    const productData = {
      name: formData.name.trim(),
      description: (formData.description || '').trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      imageUrls: formData.imageUrls,
      badges: formData.badges,
      createdAt: isEditing ? (products.find(p => p.id === isEditing)?.createdAt || serverTimestamp()) : serverTimestamp()
    };

    try {
      if (isEditing) {
        await setDoc(doc(db, 'products', isEditing), productData, { merge: true });
      } else {
        await addDoc(collection(db, 'products'), productData);
      }
      toast({ title: isEditing ? "Item Updated" : "Item Added", description: "Cloud sync complete." });
      resetForm();
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'products', operation: 'write', requestResourceData: productData }));
    } finally {
      setIsProductSaving(false);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName || !db || isCategoryAdding) return;
    
    setIsCategoryAdding(true);
    const slug = newCategoryName.toLowerCase().trim().replace(/\s+/g, '-');
    const catData = { name: newCategoryName.trim(), slug };

    try {
      await addDoc(collection(db, 'categories'), catData);
      toast({ title: "Category Created", description: `"${catData.name}" is now live.` });
      setNewCategoryName('');
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'categories', operation: 'create', requestResourceData: catData }));
    } finally {
      setIsCategoryAdding(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!db || !id || deletingId) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast({ title: "Removed", description: "Category deleted from cloud." });
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `categories/${id}`, operation: 'delete' }));
    } finally {
      setDeletingId(null);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!db || !id || deletingId) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "Deleted", description: "Menu item removed permanently." });
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `products/${id}`, operation: 'delete' }));
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      if (target === 'product') {
        setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, base64] }));
        setIsUploading(false);
      } else if (db) {
        try {
          await setDoc(doc(db, 'settings', 'store'), { logo: base64 }, { merge: true });
        } finally {
          setIsUploading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const saveSettings = async (target: 'store' | 'hero') => {
    if (!db) return;
    const setter = target === 'store' ? setIsContactsSaving : setIsVisualsSaving;
    setter(true);
    
    const data = target === 'store' ? localStoreSettings : localHeroSettings;
    const docRef = doc(db, 'settings', target);

    try {
      await setDoc(docRef, data, { merge: true });
      toast({ title: "Synced", description: `${target === 'store' ? 'Contacts' : 'Hero'} updated.` });
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: data }));
    } finally {
      setter(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl rounded-2xl">
          <CardHeader className="text-center pt-8">
            <div className="h-16 w-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-zinc-950" />
            </div>
            <CardTitle className="text-xl font-bold text-zinc-100 uppercase tracking-widest">Admin Control</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-500 uppercase">Username</Label>
                <Input value={loginForm.username} onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-12" placeholder="Admin" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-500 uppercase">Password</Label>
                <Input type="password" value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-12" placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl uppercase tracking-widest">Enter Terminal</Button>
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
              <h1 className="text-xl font-bold tracking-tight uppercase">Dashboard</h1>
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Cloud Connected</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" /> Live View
            </Button>
          </Link>
        </header>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl h-auto w-full flex-wrap justify-start">
            <TabsTrigger value="products" className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950">
              <Utensils className="h-4 w-4 mr-2" /> Products
            </TabsTrigger>
            <TabsTrigger value="categories" className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950">
              Menu Categories
            </TabsTrigger>
            <TabsTrigger value="visuals" className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950">
              Branding
            </TabsTrigger>
            <TabsTrigger value="storeinfo" className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950">
              Contact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="grid lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-5 bg-zinc-900 border-zinc-800 rounded-2xl shadow-xl h-fit">
              <CardHeader className="border-b border-zinc-800">
                <CardTitle className="text-lg font-bold flex items-center gap-3 text-amber-500 uppercase italic">
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
                      <select required className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white" value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}>
                        <option value="">Select...</option>
                        {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Product Image</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.imageUrls.map((url, i) => (
                        <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden border border-zinc-700 group">
                          <Image src={url} alt="preview" fill className="object-cover" />
                          <button type="button" onClick={() => setFormData(f => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }))} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4 text-white" /></button>
                        </div>
                      ))}
                      <label className="h-16 w-16 flex flex-col items-center justify-center bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer">
                        {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5 text-zinc-500" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'product')} />
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button disabled={isProductSaving} type="submit" className="flex-grow bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl uppercase tracking-widest text-xs h-11">
                      {isProductSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? 'Update' : 'Save Item')}
                    </Button>
                    {isEditing && <Button type="button" onClick={resetForm} className="bg-zinc-800 rounded-xl h-11 w-11 p-0"><X className="h-5 w-5" /></Button>}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-lg font-bold text-amber-500 uppercase italic">Active Menu</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex gap-4 items-center group">
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800">
                      <Image src={product.imageUrls?.[0] || 'https://picsum.photos/seed/food/200/200'} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-zinc-100 truncate text-sm uppercase">{product.name}</h4>
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
                          }} className="p-2 text-zinc-500 hover:text-white"><Edit2 className="h-4 w-4" /></button>
                          <button disabled={deletingId === product.id} onClick={() => deleteProduct(product.id)} className="p-2 text-zinc-500 hover:text-red-500">
                            {deletingId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="max-w-xl mx-auto space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 rounded-2xl p-6">
              <form onSubmit={addCategory} className="flex gap-3 mb-6">
                <Input required placeholder="New Category" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="bg-zinc-800 border-zinc-700 h-12 rounded-xl" />
                <Button disabled={isCategoryAdding} type="submit" className="bg-amber-500 text-zinc-950 rounded-xl font-bold px-8 h-12 uppercase text-xs">
                  {isCategoryAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                </Button>
              </form>
              <div className="grid gap-2">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-800 rounded-xl">
                    <span className="font-bold text-sm uppercase italic text-zinc-300">{cat.name}</span>
                    <button disabled={deletingId === cat.id} onClick={() => deleteCategory(cat.id)} className="text-zinc-500 hover:text-red-500 p-2">
                       {deletingId === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="visuals" className="max-w-4xl mx-auto space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-amber-500 uppercase italic">Hero Content</h3>
                <Button disabled={isVisualsSaving} onClick={() => saveSettings('hero')} className="bg-amber-500 text-zinc-950 font-bold gap-2 rounded-xl px-6">
                  {isVisualsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sync Hero'}
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase">Headline</Label>
                  <Input value={localHeroSettings?.bannerHeadline || ''} onChange={e => setLocalHeroSettings((p: any) => ({ ...p, bannerHeadline: e.target.value }))} className="bg-zinc-800 border-zinc-700" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase">Subtext</Label>
                  <Input value={localHeroSettings?.bannerText || ''} onChange={e => setLocalHeroSettings((p: any) => ({ ...p, bannerText: e.target.value }))} className="bg-zinc-800 border-zinc-700" />
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="storeinfo" className="max-w-2xl mx-auto">
             <Card className="bg-zinc-900 border-zinc-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-amber-500 uppercase italic">Contact Info</h3>
                  <Button disabled={isContactsSaving} onClick={() => saveSettings('store')} className="bg-amber-500 text-zinc-950 font-bold gap-2 rounded-xl px-6">
                    {isContactsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">WhatsApp</Label>
                    <Input value={localStoreSettings?.whatsappNumber || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, whatsappNumber: e.target.value }))} className="bg-zinc-800 border-zinc-700" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Phone</Label>
                    <Input value={localStoreSettings?.phone || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, phone: e.target.value }))} className="bg-zinc-800 border-zinc-700" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase">Address</Label>
                    <Input value={localStoreSettings?.address || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, address: e.target.value }))} className="bg-zinc-800 border-zinc-700" />
                  </div>
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
