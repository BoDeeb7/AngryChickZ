'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2, 
  ArrowLeft, 
  Lock, 
  X,
  Star,
  MessageSquare,
  ShieldCheck,
  Upload,
  Instagram,
  Facebook,
  MapPin,
  Phone,
  MessageCircle,
  RefreshCw,
  UploadCloud,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/tabs-ui';
import { Product, Category, StoreSettings, Review } from '@/types/restaurant';
import { useFirestore, useCollection, useDoc, useStorage } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';

const TabsListStyled = ({ children }: { children: React.ReactNode }) => (
  <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1.5 rounded-2xl h-auto w-full flex-wrap justify-start gap-1">
    {children}
  </TabsList>
);

const TabTriggerStyled = ({ value, children, icon: Icon }: { value: string, children: React.ReactNode, icon?: any }) => (
  <TabsTrigger value={value} className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950 transition-all">
    {Icon && <Icon className="h-3.5 w-3.5 mr-2" />}
    {children}
  </TabsTrigger>
);

export default function AdminContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  const [isProductSaving, setIsProductSaving] = useState(false);
  const [isCategoryAdding, setIsCategoryAdding] = useState(false);
  const [isHeroSaving, setIsHeroSaving] = useState(false);
  const [isStoreSaving, setIsStoreSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const db = useFirestore();
  const storage = useStorage();

  const productsQuery = useMemo(() => db ? query(collection(db, 'products'), orderBy('createdAt', 'desc')) : null, [db]);
  const categoriesRef = useMemo(() => db ? collection(db, 'categories') : null, [db]);
  const reviewsQuery = useMemo(() => db ? query(collection(db, 'reviews'), orderBy('createdAt', 'desc')) : null, [db]);
  const storeRef = useMemo(() => db ? doc(db, 'settings', 'store') : null, [db]);
  const heroRef = useMemo(() => db ? doc(db, 'settings', 'hero') : null, [db]);

  const { data: products = [] } = useCollection<Product>(productsQuery);
  const { data: categories = [] } = useCollection<Category>(categoriesRef);
  const { data: reviews = [] } = useCollection<Review>(reviewsQuery);
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

  useEffect(() => { if (storeSettings) setLocalStoreSettings(storeSettings); }, [storeSettings]);
  useEffect(() => { if (heroSettings) setLocalHeroSettings(heroSettings); }, [heroSettings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'Ali@AngryChickZ' && loginForm.password === 'AngryChickZ@DeebData#79') {
      setIsAuthenticated(true);
      toast({ title: "Authorized", description: "Admin terminal accessed." });
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "Invalid credentials." });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!storage) {
      toast({ variant: "destructive", title: "Config Error", description: "Storage service not found." });
      return;
    }

    setIsImageUploading(true);

    try {
      const storagePath = `products/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, url] }));
      toast({ title: "Image Ready", description: "File synced to cloud." });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not sync image. Try a smaller file." });
    } finally {
      setIsImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
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

    if (isEditing && docRef) {
      setDoc(docRef, productData, { merge: true }).catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `products/${isEditing}`, operation: 'update', requestResourceData: productData
        }));
      });
    } else {
      addDoc(collRef, productData).catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'products', operation: 'create', requestResourceData: productData
        }));
      });
    }

    // Unblock immediately
    setIsProductSaving(false);
    setFormData({ name: '', description: '', price: '', category: '', imageUrls: [], badges: [] });
    setIsEditing(null);
    toast({ title: "Action Captured", description: "Syncing with cloud database..." });
  };

  const addCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName || !db) return;
    setIsCategoryAdding(true);
    
    const catData = { 
      name: newCategoryName.trim(), 
      slug: newCategoryName.toLowerCase().trim().replace(/\s+/g, '-') 
    };

    addDoc(collection(db, 'categories'), catData).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'categories', operation: 'create', requestResourceData: catData
      }));
    });

    setIsCategoryAdding(false);
    setNewCategoryName('');
    toast({ title: "Category Created", description: "New segment added." });
  };

  const deleteItem = (id: string, coll: string) => {
    if (!db) return;
    setDeletingId(id);

    deleteDoc(doc(db, coll, id)).finally(() => {
      setDeletingId(null);
    }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `${coll}/${id}`, operation: 'delete'
      }));
    });
  };

  const saveSettings = (target: 'store' | 'hero') => {
    if (!db) return;
    const setter = target === 'store' ? setIsStoreSaving : setIsHeroSaving;
    setter(true);
    const data = target === 'store' ? localStoreSettings : localHeroSettings;
    
    setDoc(doc(db, 'settings', target), data, { merge: true }).finally(() => {
      setter(false);
    }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `settings/${target}`, operation: 'update', requestResourceData: data
      }));
    });

    toast({ title: "System Updated", description: "Branding settings synced." });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="text-center pt-12">
            <div className="h-20 w-20 bg-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
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
              <Button type="submit" className="w-full h-16 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black rounded-2xl uppercase italic text-lg shadow-xl">Auth Credentials</Button>
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
               <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Encrypted Session Active</p>
             </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="h-12 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 rounded-xl px-6 font-bold uppercase italic">
              <ArrowLeft className="h-4 w-4 mr-2" /> Live Portal
            </Button>
          </Link>
        </header>

        <Tabs defaultValue="products" className="space-y-10">
          <TabsListStyled>
            <TabTriggerStyled value="products">Products</TabTriggerStyled>
            <TabTriggerStyled value="categories">Categories</TabTriggerStyled>
            <TabTriggerStyled value="reviews" icon={MessageSquare}>Reviews</TabTriggerStyled>
            <TabTriggerStyled value="visuals">Branding</TabTriggerStyled>
            <TabTriggerStyled value="storeinfo">Contact & Social</TabTriggerStyled>
          </TabsListStyled>

          <TabsContent value="products" className="grid lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-5 bg-zinc-900 border-zinc-800 rounded-[2.5rem] shadow-2xl h-fit overflow-hidden">
              <CardHeader className="bg-zinc-950/50 p-8 border-b border-zinc-800">
                <CardTitle className="text-xl font-black text-amber-500 uppercase italic tracking-tighter flex items-center justify-between">
                  <span>{isEditing ? 'Modify Item' : 'New Dish'}</span>
                  {(isProductSaving || isImageUploading) && <Loader2 className="h-5 w-5 animate-spin text-amber-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <form onSubmit={handleSaveProduct} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Name</Label>
                    <Input required value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-12 rounded-xl" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Product Description</Label>
                    <Textarea 
                      required 
                      value={formData.description} 
                      onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} 
                      className="bg-zinc-800/50 border-zinc-700 rounded-xl min-h-[100px] font-bold p-4 focus:ring-amber-500 text-sm" 
                      placeholder="Brief details..."
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
                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                      <span>Product Media</span>
                      {isImageUploading && <span className="text-amber-500 animate-pulse font-black">Syncing...</span>}
                    </Label>
                    <div 
                      onClick={() => !isImageUploading && fileInputRef.current?.click()}
                      className={`border-2 border-dashed border-zinc-700 rounded-2xl p-6 flex flex-col items-center justify-center bg-zinc-800/50 transition-all ${isImageUploading ? 'cursor-wait opacity-50' : 'cursor-pointer hover:border-amber-500'}`}
                    >
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                      <UploadCloud className={`h-10 w-10 mb-2 ${isImageUploading ? 'text-amber-500 animate-bounce' : 'text-zinc-500'}`} />
                      <span className="text-[10px] font-black uppercase text-zinc-500">Tap to Upload Photo</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formData.imageUrls.map((url, idx) => (
                        <div key={idx} className="relative h-20 w-20 rounded-xl overflow-hidden border border-zinc-700 group shadow-lg">
                          <Image src={url} alt="Preview" fill className="object-cover" />
                          <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-5 w-5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button disabled={isProductSaving || isImageUploading} type="submit" className="w-full h-14 bg-amber-500 text-zinc-950 font-black rounded-xl uppercase italic text-sm shadow-xl active:scale-95 transition-transform">
                      {isProductSaving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (isEditing ? 'Update Item' : 'Save Dish')}
                    </Button>
                    
                    {isEditing && (
                      <Button type="button" variant="outline" onClick={() => { setIsEditing(null); setFormData({ name: '', description: '', price: '', category: '', imageUrls: [], badges: [] }); }} className="w-full h-12 border-zinc-700 text-zinc-400 font-bold rounded-xl uppercase italic text-[10px]">
                         Cancel Modification
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
              {products.length > 0 ? products.map(p => (
                <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-[2rem] flex gap-5 items-center hover:bg-zinc-800/50 transition-all group shadow-xl">
                  <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-zinc-800 flex-shrink-0">
                    <Image src={p.imageUrls?.[0] || 'https://picsum.photos/seed/food/200/200'} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-black text-xs uppercase tracking-tight italic line-clamp-1">{p.name}</h4>
                    <span className="text-amber-500 text-[10px] font-black">${p.price.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setIsEditing(p.id); setFormData({ ...p, price: p.price.toString() }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2.5 rounded-lg text-zinc-500 hover:text-white"><Edit2 className="h-4 w-4" /></button>
                    <button disabled={deletingId === p.id} onClick={() => deleteItem(p.id, 'products')} className="p-2.5 rounded-lg text-zinc-500 hover:text-red-500">
                      {deletingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center bg-zinc-900/50 rounded-[2.5rem] border border-dashed border-zinc-800">
                   <RefreshCw className="h-10 w-10 text-zinc-800 mx-auto mb-4 animate-spin" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Loading Product Catalog...</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="max-w-xl mx-auto space-y-8">
            <Card className="bg-zinc-900 border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
              <form onSubmit={addCategory} className="flex flex-col sm:flex-row gap-4 mb-8">
                <Input required placeholder="Category Identity" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="bg-zinc-800 border-zinc-700 h-14 rounded-2xl flex-grow font-bold" />
                <Button disabled={isCategoryAdding} type="submit" className="bg-amber-500 text-zinc-950 rounded-2xl font-black px-10 h-14 uppercase italic text-xs shadow-xl">
                  {isCategoryAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create'}
                </Button>
              </form>
              <div className="grid gap-3">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-5 bg-zinc-800/50 border border-zinc-800 rounded-2xl">
                    <span className="font-black text-[10px] uppercase tracking-[0.2em] italic text-zinc-300">{cat.name}</span>
                    <button disabled={deletingId === cat.id} onClick={() => deleteItem(cat.id, 'categories')} className="h-10 w-10 flex items-center justify-center rounded-xl text-zinc-600 hover:text-red-500">
                       {deletingId === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-xl font-black text-amber-500 uppercase italic mb-8 flex items-center gap-4">
              <Star className="h-6 w-6 fill-amber-500 text-amber-500" /> Customer Reviews
            </h2>
            <div className="grid gap-5">
              {reviews.map(rev => (
                <Card key={rev.id} className="bg-zinc-900 border-zinc-800 rounded-[1.5rem] shadow-xl overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <span className="font-black uppercase text-sm text-zinc-100 italic tracking-tight">{rev.customerName}</span>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => <Star key={i} className={`h-3 w-3 ${i <= rev.rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-700'}`} />)}
                          </div>
                        </div>
                        <p className="text-zinc-400 text-sm italic font-medium">"{rev.comment}"</p>
                      </div>
                      <Button variant="ghost" size="icon" disabled={deletingId === rev.id} onClick={() => deleteItem(rev.id!, 'reviews')} className="h-12 w-12 rounded-xl text-zinc-700 hover:text-red-500">
                        {deletingId === rev.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="visuals" className="max-w-4xl mx-auto space-y-8">
            <Card className="bg-zinc-900 border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-amber-500 uppercase italic tracking-tighter">Hero Identity</h3>
                <Button disabled={isHeroSaving} onClick={() => saveSettings('hero')} className="h-14 bg-amber-500 text-zinc-950 font-black rounded-2xl px-10 uppercase italic text-xs shadow-xl">
                  {isHeroSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Hero'}
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Main Headline</Label>
                  <Input value={localHeroSettings?.bannerHeadline || ''} onChange={e => setLocalHeroSettings((p: any) => ({ ...p, bannerHeadline: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-14 rounded-2xl font-bold" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sub-Text</Label>
                  <Input value={localHeroSettings?.bannerText || ''} onChange={e => setLocalHeroSettings((p: any) => ({ ...p, bannerText: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-14 rounded-2xl font-bold" />
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="storeinfo" className="max-w-4xl mx-auto">
             <Card className="bg-zinc-900 border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black text-amber-500 uppercase italic tracking-tighter">Contact Config</h3>
                  <Button disabled={isStoreSaving} onClick={() => saveSettings('store')} className="h-14 bg-amber-500 text-zinc-950 font-black rounded-2xl px-10 uppercase italic text-xs shadow-xl">
                    {isStoreSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update Info'}
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </Label>
                    <Input placeholder="+961..." value={localStoreSettings?.whatsappNumber || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, whatsappNumber: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-14 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Phone className="h-3 w-3" /> Phone
                    </Label>
                    <Input placeholder="01 123 456" value={localStoreSettings?.phone || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, phone: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-14 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> Address
                    </Label>
                    <Input placeholder="Street, City" value={localStoreSettings?.address || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, address: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-14 rounded-2xl font-bold" />
                  </div>
                </div>

                <div className="space-y-8 border-t border-zinc-800 pt-10">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Social Connections</h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Instagram className="h-3 w-3" /> Instagram
                      </Label>
                      <Input placeholder="https://..." value={localStoreSettings?.instagram || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, instagram: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-12 rounded-xl text-xs" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Facebook className="h-3 w-3" /> Facebook
                      </Label>
                      <Input placeholder="https://..." value={localStoreSettings?.facebook || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, facebook: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-12 rounded-xl text-xs" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                         TikTok
                      </Label>
                      <Input placeholder="https://..." value={localStoreSettings?.tiktok || ''} onChange={e => setLocalStoreSettings((p: any) => ({ ...p, tiktok: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-12 rounded-xl text-xs" />
                    </div>
                  </div>
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
