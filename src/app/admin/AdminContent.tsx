
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
  Database,
  RefreshCw,
  Globe,
  Layout,
  Instagram,
  Facebook,
  Phone,
  MapPin,
  MessageCircle
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'Ali@AngryChickZ' && loginForm.password === 'AngryChickZ@DeebData#79') {
      setIsAuthenticated(true);
      toast({ title: "Authorized", description: "Terminal Unlocked." });
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "Invalid credentials." });
    }
  };

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
      toast({ title: "Success", description: "Database seeded." });
    } catch (e) {
      toast({ variant: "destructive", title: "Seed Failed" });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    setIsImageUploading(true);
    const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);

    uploadBytes(storageRef, file)
      .then(async (snapshot) => {
        const url = await getDownloadURL(snapshot.ref);
        setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, url] }));
        toast({ title: "Upload Success" });
      })
      .catch(() => toast({ variant: "destructive", title: "Upload Failed" }))
      .finally(() => {
        setIsImageUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
  };

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
      .then(() => {
        setFormData({ name: '', description: '', price: '', category: '', imageUrls: [], badges: [] });
        setIsEditing(null);
        toast({ title: "Product Stored" });
      })
      .catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: isEditing ? `products/${isEditing}` : 'products', 
          operation: isEditing ? 'update' : 'create', 
          requestResourceData: productData
        }));
      })
      .finally(() => setIsProductSaving(false));
  };

  const handleSaveSettings = () => {
    if (!db) return;
    setDoc(doc(db, 'settings', 'store'), settingsForm, { merge: true })
      .then(() => toast({ title: "Profile Updated" }))
      .catch(() => toast({ variant: "destructive", title: "Update Failed" }));
  };

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

  const forceReset = () => {
    setIsImageUploading(false);
    setIsProductSaving(false);
    setIsCategoryAdding(false);
    toast({ title: "Status Reset" });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl rounded-[2rem]">
          <CardHeader className="text-center pt-8">
            <div className="h-16 w-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-black" />
            </div>
            <CardTitle className="text-xl font-black text-zinc-100 uppercase italic tracking-tighter">Terminal Access</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Username</Label>
                <Input value={loginForm.username} onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Password</Label>
                <Input type="password" value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-12 rounded-xl" />
              </div>
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
               <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Session Active</p>
             </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={forceReset} variant="outline" className="h-10 border-red-500/20 text-red-500 text-[9px] uppercase font-black italic">Reset</Button>
            <Button onClick={seedInitialData} disabled={isSeeding} className="h-10 bg-blue-600 hover:bg-blue-700 text-[9px] font-bold uppercase italic">
              {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
              Seed
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
            <TabsTrigger value="contact" className="px-4 py-2 rounded-lg font-black text-[9px] uppercase italic data-[state=active]:bg-amber-500 data-[state=active]:text-black">Contact & Branding</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="grid lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-5 bg-zinc-900 border-zinc-800 rounded-[2rem] shadow-xl h-fit overflow-hidden">
              <CardHeader className="bg-zinc-950/30 p-6 border-b border-zinc-800">
                <CardTitle className="text-lg font-black text-amber-500 uppercase italic flex items-center justify-between">
                  <span>{isEditing ? 'Modify Item' : 'New Dish'}</span>
                  {(isProductSaving || isImageUploading) && <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-zinc-500 uppercase">Product Name</Label>
                    <Input required value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-zinc-500 uppercase">Description (Ingredients / Heat)</Label>
                    <Textarea 
                      required 
                      value={formData.description} 
                      onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} 
                      className="bg-zinc-800 border-zinc-700 rounded-xl min-h-[100px] text-xs font-bold" 
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
                    <Label className="text-[9px] font-black text-zinc-500 uppercase">Media</Label>
                    <div 
                      onClick={() => !isImageUploading && fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center bg-zinc-800/30 cursor-pointer transition-all ${isImageUploading ? 'opacity-50 border-amber-500' : 'border-zinc-700 hover:border-amber-500'}`}
                    >
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" disabled={isImageUploading} />
                      {isImageUploading ? <RefreshCw className="h-6 w-6 mb-2 animate-spin text-amber-500" /> : <UploadCloud className="h-6 w-6 mb-2 text-zinc-500" />}
                      <span className="text-[8px] font-black uppercase text-zinc-500">{isImageUploading ? 'Uploading...' : 'Tap to Upload'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.imageUrls.map((url, idx) => (
                        <div key={idx} className="relative h-12 w-12 rounded-lg overflow-hidden border border-zinc-700 group">
                          <Image src={url} alt="Preview" fill className="object-cover" />
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== idx) }))} className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button disabled={isProductSaving || isImageUploading} type="submit" className="w-full h-12 bg-amber-500 text-black font-black rounded-xl uppercase italic text-xs shadow-lg active:scale-95">
                    {isProductSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? 'Update Item' : 'Save Dish')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-3 rounded-[1.2rem] flex gap-3 items-center hover:bg-zinc-800/50 transition-all shadow-lg">
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-zinc-800">
                    <Image src={p.imageUrls?.[0] || 'https://picsum.photos/seed/food/200/200'} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-black text-[9px] uppercase italic truncate">{p.name}</h4>
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

          <TabsContent value="contact" className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 rounded-[2rem] p-8 shadow-xl">
              <div className="space-y-6">
                 <div className="flex items-center gap-3 mb-2">
                   <Globe className="text-amber-500 h-5 w-5" />
                   <h3 className="font-black uppercase italic text-base">Branding & Social</h3>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[9px] font-black text-zinc-500 uppercase">Logo URL (or tap to upload logo icon)</Label>
                    <div className="flex gap-2">
                      <Input placeholder="https://..." value={settingsForm.logo || storeSettings?.logo || ''} onChange={e => setSettingsForm(s => ({ ...s, logo: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                    </div>
                 </div>

                 <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black text-zinc-500 uppercase flex items-center gap-1"><MessageCircle className="h-3 w-3" /> WhatsApp Link</Label>
                      <Input placeholder="96170123456" value={settingsForm.whatsappNumber || storeSettings?.whatsappNumber || ''} onChange={e => setSettingsForm(s => ({ ...s, whatsappNumber: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black text-zinc-500 uppercase flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</Label>
                      <Input placeholder="+961 70 123 456" value={settingsForm.phone || storeSettings?.phone || ''} onChange={e => setSettingsForm(s => ({ ...s, phone: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[9px] font-black text-zinc-500 uppercase flex items-center gap-1"><MapPin className="h-3 w-3" /> Address</Label>
                    <Input placeholder="Location details..." value={settingsForm.address || storeSettings?.address || ''} onChange={e => setSettingsForm(s => ({ ...s, address: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                 </div>

                 <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black text-zinc-500 uppercase">TikTok</Label>
                      <Input value={settingsForm.tiktok || storeSettings?.tiktok || ''} onChange={e => setSettingsForm(s => ({ ...s, tiktok: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black text-zinc-500 uppercase">Instagram</Label>
                      <Input value={settingsForm.instagram || storeSettings?.instagram || ''} onChange={e => setSettingsForm(s => ({ ...s, instagram: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black text-zinc-500 uppercase">Facebook</Label>
                      <Input value={settingsForm.facebook || storeSettings?.facebook || ''} onChange={e => setSettingsForm(s => ({ ...s, facebook: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                    </div>
                 </div>

                 <Button onClick={handleSaveSettings} className="w-full h-12 bg-amber-500 text-black font-black rounded-xl uppercase italic shadow-lg active:scale-95 transition-all">
                   Save Brand Profile
                 </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="max-w-xl mx-auto space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 rounded-[2rem] p-8 shadow-xl">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newCategoryName || !db) return;
                setIsCategoryAdding(true);
                addDoc(collection(db, 'categories'), { 
                  name: newCategoryName.trim(), 
                  slug: newCategoryName.toLowerCase().trim().replace(/\s+/g, '-') 
                }).then(() => {
                   setNewCategoryName('');
                   toast({ title: "Category Created" });
                }).finally(() => setIsCategoryAdding(false));
              }} className="flex flex-col sm:flex-row gap-3 mb-6">
                <Input required placeholder="Category Name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="bg-zinc-800 border-zinc-700 h-12 rounded-xl flex-grow font-bold" />
                <Button disabled={isCategoryAdding} type="submit" className="bg-amber-500 text-black rounded-xl font-black px-8 h-12 uppercase italic text-[10px] shadow-lg">
                  {isCategoryAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                </Button>
              </form>
              <div className="grid gap-2">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-zinc-800/30 border border-zinc-800 rounded-xl">
                    <span className="font-black text-[9px] uppercase italic text-zinc-300">{cat.name}</span>
                    <button disabled={deletingId === cat.id} onClick={() => deleteItem(cat.id, 'categories')} className="text-zinc-600 hover:text-red-500 transition-colors">
                       {deletingId === cat.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
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
