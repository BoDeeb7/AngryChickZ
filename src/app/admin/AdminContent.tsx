'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2, 
  ArrowLeft, 
  Lock, 
  X,
  ShieldCheck,
  UploadCloud,
  RotateCcw,
  Database
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
import Link from 'next/link';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

export default function AdminContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  // Loading states
  const [isProductSaving, setIsProductSaving] = useState(false);
  const [isCategoryAdding, setIsCategoryAdding] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const db = useFirestore();
  const storage = useStorage();

  // Global Sync Queries
  const productsQuery = useMemo(() => db ? query(collection(db, 'products'), orderBy('createdAt', 'desc')) : null, [db]);
  const categoriesQuery = useMemo(() => db ? query(collection(db, 'categories'), orderBy('name', 'asc')) : null, [db]);
  const storeSettingsRef = useMemo(() => db ? doc(db, 'settings', 'store') : null, [db]);

  const { data: products = [] } = useCollection<Product>(productsQuery);
  const { data: categories = [] } = useCollection<Category>(categoriesQuery);
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

  // 1. SAFETY RESET: Prevent infinite button spinning
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isImageUploading || isProductSaving || isCategoryAdding || deletingId || isSeeding) {
      timeout = setTimeout(() => {
        setIsImageUploading(false);
        setIsProductSaving(false);
        setIsCategoryAdding(false);
        setIsSeeding(false);
        setDeletingId(null);
      }, 10000); // 10s Failsafe
    }
    return () => clearTimeout(timeout);
  }, [isImageUploading, isProductSaving, isCategoryAdding, deletingId, isSeeding]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // NEW CREDENTIALS APPLIED
    if (loginForm.username === 'Ali@AngryChickZ' && loginForm.password === 'AngryChickZ@DeebData#79') {
      setIsAuthenticated(true);
      toast({ title: "Terminal Authorized" });
    } else {
      toast({ variant: "destructive", title: "Access Denied" });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    setIsImageUploading(true);
    const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, imageUrls: [url] }));
      toast({ title: "Image Sync Complete" });
    } catch (err) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setIsImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsProductSaving(true);

    const data = {
      ...formData,
      price: parseFloat(formData.price || '0'),
      createdAt: isEditing ? (products.find(p => p.id === isEditing)?.createdAt || serverTimestamp()) : serverTimestamp()
    };

    try {
      if (isEditing) {
        await setDoc(doc(db, 'products', isEditing), data, { merge: true });
      } else {
        await addDoc(collection(db, 'products'), data);
      }
      setFormData({ name: '', description: '', price: '', category: '', imageUrls: [], badges: [] });
      setIsEditing(null);
      toast({ title: "Cloud Data Synced" });
    } finally {
      setIsProductSaving(false);
    }
  };

  const handleSeedData = async () => {
    if (!db || isSeeding) return;
    setIsSeeding(true);
    try {
      for (const product of MOCK_PRODUCTS) {
        await addDoc(collection(db, 'products'), {
          ...product,
          createdAt: serverTimestamp()
        });
      }
      toast({ title: "Mock Data Seeding Complete" });
    } finally {
      setIsSeeding(false);
    }
  };

  const deleteItem = async (id: string, coll: string) => {
    if (!db) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, coll, id));
      toast({ title: "Item Removed Locally & Cloud" });
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl rounded-[2rem]">
          <CardHeader className="text-center pt-8">
            <div className="h-16 w-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-black" />
            </div>
            <CardTitle className="text-xl font-black text-zinc-100 uppercase italic tracking-tighter">Terminal Security</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input placeholder="Username" value={loginForm.username} onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-12 rounded-xl" />
              <Input type="password" placeholder="Passkey" value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-12 rounded-xl" />
              <Button type="submit" className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl uppercase italic">Authorize</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <div className="container mx-auto max-w-6xl p-4 md:p-8">
        <header className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800 shadow-xl">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
               <ShieldCheck className="text-amber-500 h-5 w-5" />
             </div>
             <div>
               <h1 className="text-lg font-black tracking-tighter uppercase italic">Control <span className="text-amber-500">Center</span></h1>
               <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Global Sync Status: Active</p>
             </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSeedData} disabled={isSeeding} variant="outline" className="h-10 border-amber-500/20 bg-amber-500/5 rounded-xl px-4 text-[9px] font-bold uppercase italic text-amber-500 hover:bg-amber-500 hover:text-black">
              {isSeeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />} Seed Data
            </Button>
            <Link href="/">
              <Button variant="outline" className="h-10 bg-zinc-800 border-zinc-700 rounded-xl px-4 font-bold uppercase italic text-[9px]">
                <ArrowLeft className="h-4 w-4 mr-2" /> Live Portal
              </Button>
            </Link>
          </div>
        </header>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl h-auto w-full justify-start gap-1 flex-wrap">
            <TabsTrigger value="products" className="px-4 py-2 rounded-lg font-black text-[9px] uppercase italic data-[state=active]:bg-amber-500 data-[state=active]:text-black">Products</TabsTrigger>
            <TabsTrigger value="categories" className="px-4 py-2 rounded-lg font-black text-[9px] uppercase italic data-[state=active]:bg-amber-500 data-[state=active]:text-black">Categories</TabsTrigger>
            <TabsTrigger value="contact" className="px-4 py-2 rounded-lg font-black text-[9px] uppercase italic data-[state=active]:bg-amber-500 data-[state=active]:text-black">Branding</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="grid lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-5 bg-zinc-900 border-zinc-800 rounded-[2rem] shadow-xl h-fit overflow-hidden">
              <CardHeader className="bg-zinc-950/30 p-6 border-b border-zinc-800">
                <CardTitle className="text-lg font-black text-amber-500 uppercase italic">
                  {isEditing ? 'Modify Item' : 'Create Dish'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-zinc-500 uppercase">Product Name</Label>
                    <Input required value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-zinc-500 uppercase">Short Description</Label>
                    <Textarea 
                      required 
                      value={formData.description} 
                      onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} 
                      className="bg-zinc-800 border-zinc-700 rounded-xl min-h-[80px] text-xs font-bold" 
                      placeholder="Dish details..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black text-zinc-500 uppercase">Price ($)</Label>
                      <Input required type="number" step="0.01" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black text-zinc-500 uppercase">Category</Label>
                      <select required className="w-full h-11 px-4 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-bold" value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}>
                        <option value="">Select...</option>
                        {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[9px] font-black text-zinc-500 uppercase">Media Upload</Label>
                    <div 
                      onClick={() => !isImageUploading && fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center bg-zinc-800/30 cursor-pointer transition-all ${isImageUploading ? 'opacity-50 border-amber-500' : 'border-zinc-700 hover:border-amber-500'}`}
                    >
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" disabled={isImageUploading} />
                      {isImageUploading ? <Loader2 className="h-6 w-6 mb-2 animate-spin text-amber-500" /> : <UploadCloud className="h-6 w-6 mb-2 text-zinc-500" />}
                      <span className="text-[8px] font-black uppercase text-zinc-500">{isImageUploading ? 'Syncing...' : 'Upload Cloud Image'}</span>
                    </div>
                    {formData.imageUrls.length > 0 && (
                      <div className="relative h-24 w-full rounded-xl overflow-hidden border border-amber-500/30">
                        <Image src={formData.imageUrls[0]} alt="Preview" fill className="object-cover" />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, imageUrls: [] }))} className="absolute top-2 right-2 bg-red-600/80 p-1 rounded-full backdrop-blur-md">
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    )}
                  </div>

                  <Button disabled={isProductSaving || isImageUploading} type="submit" className="w-full h-12 bg-amber-500 text-black font-black rounded-xl uppercase italic text-xs">
                    {isProductSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? 'Update Global Item' : 'Add to Cloud')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-3 rounded-[1.2rem] flex gap-3 items-center hover:bg-zinc-800 transition-colors">
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-zinc-800">
                    <Image src={p.imageUrls?.[0] || 'https://picsum.photos/seed/food/200/200'} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-black text-[10px] uppercase italic truncate">{p.name}</h4>
                    <span className="text-amber-500 text-[9px] font-black">${p.price.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setIsEditing(p.id); setFormData({ ...p, price: p.price.toString() }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1.5 text-zinc-500 hover:text-white"><Edit2 className="h-3 w-3" /></button>
                    <button disabled={deletingId === p.id} onClick={() => deleteItem(p.id, 'products')} className="p-1.5 text-zinc-500 hover:text-red-500">
                      {deletingId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="max-w-xl mx-auto space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 rounded-[2rem] p-8">
              <form onSubmit={async (e) => { e.preventDefault(); if(!newCategoryName || !db) return; setIsCategoryAdding(true); try { await addDoc(collection(db, 'categories'), { name: newCategoryName.trim(), slug: newCategoryName.toLowerCase().trim().replace(/\s+/g, '-') }); setNewCategoryName(''); toast({title: "Category Synced"}); } finally { setIsCategoryAdding(false); } }} className="flex flex-col sm:flex-row gap-3 mb-6">
                <Input required placeholder="Category Name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="bg-zinc-800 border-zinc-700 h-12 rounded-xl flex-grow font-bold" />
                <Button disabled={isCategoryAdding} type="submit" className="bg-amber-500 text-black rounded-xl font-black px-8 h-12 uppercase italic text-[10px]">
                  {isCategoryAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Category'}
                </Button>
              </form>
              <div className="grid gap-2">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-zinc-800/30 border border-zinc-800 rounded-xl">
                    <span className="font-black text-[9px] uppercase italic text-zinc-300">{cat.name}</span>
                    <button disabled={deletingId === cat.id} onClick={() => deleteItem(cat.id, 'categories')} className="text-zinc-600 hover:text-red-500">
                       {deletingId === cat.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 rounded-[2rem] p-8">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black text-zinc-500 uppercase">Global Logo URL</Label>
                    <Input placeholder="https://..." value={settingsForm.logo || storeSettings?.logo || ''} onChange={e => setSettingsForm(s => ({ ...s, logo: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                 </div>
                 <div className="grid sm:grid-cols-2 gap-4">
                    <Input placeholder="WhatsApp Global" value={settingsForm.whatsappNumber || storeSettings?.whatsappNumber || ''} onChange={e => setSettingsForm(s => ({ ...s, whatsappNumber: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                    <Input placeholder="Support Phone" value={settingsForm.phone || storeSettings?.phone || ''} onChange={e => setSettingsForm(s => ({ ...s, phone: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                 </div>
                 <Input placeholder="Main Address" value={settingsForm.address || storeSettings?.address || ''} onChange={e => setSettingsForm(s => ({ ...s, address: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                 <div className="grid sm:grid-cols-3 gap-4">
                    <Input placeholder="TikTok Link" value={settingsForm.tiktok || storeSettings?.tiktok || ''} onChange={e => setSettingsForm(s => ({ ...s, tiktok: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                    <Input placeholder="Instagram Link" value={settingsForm.instagram || storeSettings?.instagram || ''} onChange={e => setSettingsForm(s => ({ ...s, instagram: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                    <Input placeholder="Facebook Link" value={settingsForm.facebook || storeSettings?.facebook || ''} onChange={e => setSettingsForm(s => ({ ...s, facebook: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                 </div>
                 <Button onClick={async () => { if(!db) return; await setDoc(doc(db, 'settings', 'store'), { ...storeSettings, ...settingsForm }, { merge: true }); toast({title: "Branding Synced Globally"}); }} className="w-full h-12 bg-amber-500 text-black font-black rounded-xl uppercase italic shadow-lg">Update Profile</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
