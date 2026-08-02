
'use client';

import { useState, useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2, 
  ArrowLeft, 
  Lock, 
  X,
  MessageSquare,
  ShieldCheck,
  UploadCloud,
  Database,
  RefreshCw,
  Settings,
  Globe,
  Layout
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, Category, StoreSettings } from '@/types/restaurant';
import { useFirestore, useCollection, useDoc, useStorage } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mock-data';
import Link from 'next/link';

export default function AdminContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  const [isProductSaving, setIsProductSaving] = useState(false);
  const [isCategoryAdding, setIsCategoryAdding] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const db = useFirestore();
  const storage = useStorage();

  // Queries
  const productsQuery = useMemo(() => db ? query(collection(db, 'products'), orderBy('createdAt', 'desc')) : null, [db]);
  const categoriesRef = useMemo(() => db ? collection(db, 'categories') : null, [db]);
  const storeSettingsRef = useMemo(() => db ? doc(db, 'settings', 'store') : null, [db]);

  const { data: products = [] } = useCollection<Product>(productsQuery);
  const { data: categories = [] } = useCollection<Category>(categoriesRef);
  const { data: storeSettings } = useDoc<StoreSettings>(storeSettingsRef);

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrls: [] as string[],
    badges: [] as string[],
  });

  const [settingsForm, setSettingsForm] = useState<Partial<StoreSettings>>({});
  const [newCategoryName, setNewCategoryName] = useState('');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'Ali@AngryChickZ' && loginForm.password === 'AngryChickZ@DeebData#79') {
      setIsAuthenticated(true);
      toast({ title: "Authorized", description: "Terminal Unlocked." });
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "Invalid credentials." });
    }
  };

  // Seed Data
  const seedInitialData = async () => {
    if (!db) return;
    setIsSeeding(true);
    try {
      for (const cat of MOCK_CATEGORIES) {
        await addDoc(collection(db, 'categories'), cat);
      }
      for (const prod of MOCK_PRODUCTS) {
        await addDoc(collection(db, 'products'), {
          ...prod,
          createdAt: serverTimestamp()
        });
      }
      toast({ title: "Success", description: "Database seeded with items." });
    } catch (e) {
      toast({ variant: "destructive", title: "Seed Failed" });
    } finally {
      setIsSeeding(false);
    }
  };

  // Upload Logic - REBUILT CLEAN
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    setIsImageUploading(true);
    const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);

    uploadBytes(storageRef, file)
      .then(async (snapshot) => {
        const url = await getDownloadURL(snapshot.ref);
        setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, url] }));
        toast({ title: "Image Ready", description: "File uploaded successfully." });
      })
      .catch((err) => {
        toast({ variant: "destructive", title: "Upload Failed" });
      })
      .finally(() => {
        setIsImageUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
  };

  // Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsProductSaving(true);

    const productData = {
      ...formData,
      price: parseFloat(formData.price || '0'),
      createdAt: isEditing ? (products.find(p => p.id === isEditing)?.createdAt || serverTimestamp()) : serverTimestamp()
    };

    const docRef = isEditing ? doc(db, 'products', isEditing) : null;
    const collRef = collection(db, 'products');

    const operation = isEditing && docRef 
      ? setDoc(docRef, productData, { merge: true })
      : addDoc(collRef, productData);

    operation
      .catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: isEditing ? `products/${isEditing}` : 'products', 
          operation: isEditing ? 'update' : 'create', 
          requestResourceData: productData
        }));
      })
      .finally(() => {
        setIsProductSaving(false);
        setFormData({ name: '', description: '', price: '', category: '', imageUrls: [], badges: [] });
        setIsEditing(null);
        toast({ title: "Sync Complete", description: "Product data stored." });
      });
  };

  // Save Settings
  const handleSaveSettings = () => {
    if (!db) return;
    setDoc(doc(db, 'settings', 'store'), settingsForm, { merge: true })
      .then(() => toast({ title: "Settings Saved" }))
      .catch(() => toast({ variant: "destructive", title: "Update Failed" }));
  };

  // Delete Logic
  const deleteItem = (id: string, coll: string) => {
    if (!db) return;
    setDeletingId(id);
    deleteDoc(doc(db, coll, id))
      .catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `${coll}/${id}`, operation: 'delete'
        }));
      })
      .finally(() => setDeletingId(null));
  };

  // Forced Reset
  const forceReset = () => {
    setIsImageUploading(false);
    setIsProductSaving(false);
    setIsCategoryAdding(false);
    toast({ title: "Status Reset", description: "All locks released." });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl rounded-[2.5rem]">
          <CardHeader className="text-center pt-12">
            <div className="h-20 w-20 bg-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Lock className="h-10 w-10 text-zinc-950" />
            </div>
            <CardTitle className="text-2xl font-black text-zinc-100 uppercase italic tracking-tighter">Terminal Access</CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Username</Label>
                <Input value={loginForm.username} onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-14 rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Password</Label>
                <Input type="password" value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-14 rounded-2xl" />
              </div>
              <Button type="submit" className="w-full h-16 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black rounded-2xl uppercase italic text-lg">Auth Credentials</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <div className="container mx-auto max-w-6xl p-4 md:p-10">
        <header className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12 bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
               <ShieldCheck className="text-amber-500 h-6 w-6" />
             </div>
             <div>
               <h1 className="text-2xl font-black tracking-tighter uppercase italic">Control <span className="text-amber-500">Center</span></h1>
               <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Session Active</p>
             </div>
          </div>
          <div className="flex gap-4">
            <Button onClick={forceReset} variant="outline" className="h-12 border-red-500/20 text-red-500 hover:bg-red-500/10 text-[10px] uppercase font-black italic">
              Emergency Reset
            </Button>
            <Button onClick={seedInitialData} disabled={isSeeding} className="h-12 bg-blue-600 hover:bg-blue-700 text-[10px] font-bold uppercase italic">
              {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
              Seed Data
            </Button>
            <Link href="/">
              <Button variant="outline" className="h-12 bg-zinc-800 border-zinc-700 rounded-xl px-6 font-bold uppercase italic text-[10px]">
                <ArrowLeft className="h-4 w-4 mr-2" /> Live Portal
              </Button>
            </Link>
          </div>
        </header>

        <Tabs defaultValue="products" className="space-y-10">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="products" className="px-6 py-3 rounded-xl font-black text-[10px] uppercase italic data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950">Products</TabsTrigger>
            <TabsTrigger value="categories" className="px-6 py-3 rounded-xl font-black text-[10px] uppercase italic data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950">Categories</TabsTrigger>
            <TabsTrigger value="contact" className="px-6 py-3 rounded-xl font-black text-[10px] uppercase italic data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950">Contact & Social</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="grid lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-5 bg-zinc-900 border-zinc-800 rounded-[2.5rem] shadow-2xl h-fit overflow-hidden">
              <CardHeader className="bg-zinc-950/50 p-8 border-b border-zinc-800">
                <CardTitle className="text-xl font-black text-amber-500 uppercase italic tracking-tighter flex items-center justify-between">
                  <span>{isEditing ? 'Modify Item' : 'New Dish'}</span>
                  {(isProductSaving || isImageUploading) && <RefreshCw className="h-5 w-5 animate-spin text-amber-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <form onSubmit={handleSaveProduct} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Name</Label>
                    <Input required value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-12 rounded-xl" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Product Description</Label>
                    <Textarea 
                      required 
                      value={formData.description} 
                      onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} 
                      placeholder="Ingredients, heat level, etc..."
                      className="bg-zinc-800/50 border-zinc-700 rounded-xl min-h-[120px] font-bold p-4 text-sm" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Price ($)</Label>
                      <Input required type="number" step="0.01" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Category</Label>
                      <select required className="w-full h-12 px-4 bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-bold" value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}>
                        <option value="">Select...</option>
                        {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Media</Label>
                    <div 
                      onClick={() => !isImageUploading && fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center bg-zinc-800/50 cursor-pointer transition-all ${isImageUploading ? 'opacity-50 cursor-not-allowed border-amber-500' : 'border-zinc-700 hover:border-amber-500'}`}
                    >
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" disabled={isImageUploading} />
                      {isImageUploading ? <RefreshCw className="h-8 w-8 mb-2 animate-spin text-amber-500" /> : <UploadCloud className="h-8 w-8 mb-2 text-zinc-500" />}
                      <span className="text-[8px] font-black uppercase text-zinc-500">{isImageUploading ? 'Processing File...' : 'Tap to Upload'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formData.imageUrls.map((url, idx) => (
                        <div key={idx} className="relative h-16 w-16 rounded-xl overflow-hidden border border-zinc-700 group">
                          <Image src={url} alt="Preview" fill className="object-cover" />
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== idx) }))} className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button disabled={isProductSaving || isImageUploading} type="submit" className="w-full h-14 bg-amber-500 text-zinc-950 font-black rounded-xl uppercase italic text-sm shadow-xl active:scale-95">
                    {isProductSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (isEditing ? 'Update Item' : 'Save Dish')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-[1.5rem] flex gap-4 items-center hover:bg-zinc-800/50 transition-all shadow-xl">
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-zinc-800">
                    <Image src={p.imageUrls?.[0] || 'https://picsum.photos/seed/food/200/200'} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-black text-[10px] uppercase italic">{p.name}</h4>
                    <span className="text-amber-500 text-[10px] font-black">${p.price.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setIsEditing(p.id); setFormData({ ...p, price: p.price.toString() }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2 text-zinc-500 hover:text-white"><Edit2 className="h-3 w-3" /></button>
                    <button disabled={deletingId === p.id} onClick={() => deleteItem(p.id, 'products')} className="p-2 text-zinc-500 hover:text-red-500">
                      {deletingId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contact" className="max-w-2xl mx-auto space-y-8">
            <Card className="bg-zinc-900 border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
              <div className="space-y-6">
                 <div className="flex items-center gap-3 mb-4">
                   <Globe className="text-amber-500 h-5 w-5" />
                   <h3 className="font-black uppercase italic text-lg">Identity & Links</h3>
                 </div>

                 <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-zinc-500 uppercase">WhatsApp (Order Link)</Label>
                      <Input 
                        placeholder="e.g. 96170123456" 
                        value={settingsForm.whatsappNumber || storeSettings?.whatsappNumber || ''} 
                        onChange={e => setSettingsForm(s => ({ ...s, whatsappNumber: e.target.value }))}
                        className="bg-zinc-800 border-zinc-700 h-12 rounded-xl" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-zinc-500 uppercase">Contact Phone</Label>
                      <Input 
                        placeholder="+961 70 123 456" 
                        value={settingsForm.phone || storeSettings?.phone || ''} 
                        onChange={e => setSettingsForm(s => ({ ...s, phone: e.target.value }))}
                        className="bg-zinc-800 border-zinc-700 h-12 rounded-xl" 
                      />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase">Physical Address</Label>
                    <Input 
                      placeholder="Beirut, City Center Mall" 
                      value={settingsForm.address || storeSettings?.address || ''} 
                      onChange={e => setSettingsForm(s => ({ ...s, address: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 h-12 rounded-xl" 
                    />
                 </div>

                 <div className="grid sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-zinc-500 uppercase">TikTok URL</Label>
                      <Input value={settingsForm.tiktok || storeSettings?.tiktok || ''} onChange={e => setSettingsForm(s => ({ ...s, tiktok: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-zinc-500 uppercase">Instagram URL</Label>
                      <Input value={settingsForm.instagram || storeSettings?.instagram || ''} onChange={e => setSettingsForm(s => ({ ...s, instagram: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-zinc-500 uppercase">Facebook URL</Label>
                      <Input value={settingsForm.facebook || storeSettings?.facebook || ''} onChange={e => setSettingsForm(s => ({ ...s, facebook: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-12 rounded-xl" />
                    </div>
                 </div>

                 <Button onClick={handleSaveSettings} className="w-full h-14 bg-amber-500 text-zinc-950 font-black rounded-xl uppercase italic shadow-xl">
                   Update Brand Profile
                 </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="max-w-xl mx-auto space-y-8">
            <Card className="bg-zinc-900 border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newCategoryName || !db) return;
                setIsCategoryAdding(true);
                addDoc(collection(db, 'categories'), { 
                  name: newCategoryName.trim(), 
                  slug: newCategoryName.toLowerCase().trim().replace(/\s+/g, '-') 
                }).finally(() => {
                  setIsCategoryAdding(false);
                  setNewCategoryName('');
                });
              }} className="flex flex-col sm:flex-row gap-4 mb-8">
                <Input required placeholder="Category Identity" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="bg-zinc-800 border-zinc-700 h-14 rounded-2xl flex-grow font-bold" />
                <Button disabled={isCategoryAdding} type="submit" className="bg-amber-500 text-zinc-950 rounded-2xl font-black px-10 h-14 uppercase italic text-xs shadow-xl">
                  {isCategoryAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create'}
                </Button>
              </form>
              <div className="grid gap-3">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-800 rounded-xl">
                    <span className="font-black text-[10px] uppercase italic text-zinc-300">{cat.name}</span>
                    <button disabled={deletingId === cat.id} onClick={() => deleteItem(cat.id, 'categories')} className="text-zinc-600 hover:text-red-500">
                       {deletingId === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
