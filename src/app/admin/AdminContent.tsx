'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowLeft, 
  Lock, 
  X,
  ShieldCheck,
  UploadCloud,
  Database,
  Star,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, Category, StoreSettings, Review } from '@/types/restaurant';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

export default function AdminContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  const [isProductSaving, setIsProductSaving] = useState(false);
  const [isCategoryAdding, setIsCategoryAdding] = useState(false);
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const db = useFirestore();

  const productsQuery = useMemo(() => db ? query(collection(db, 'products'), orderBy('createdAt', 'desc')) : null, [db]);
  const categoriesQuery = useMemo(() => db ? query(collection(db, 'categories'), orderBy('name', 'asc')) : null, [db]);
  const reviewsQuery = useMemo(() => db ? query(collection(db, 'reviews'), orderBy('createdAt', 'desc')) : null, [db]);
  const storeSettingsRef = useMemo(() => db ? doc(db, 'settings', 'store') : null, [db]);

  const { data: products = [] } = useCollection<Product>(productsQuery);
  const { data: categories = [] } = useCollection<Category>(categoriesQuery);
  const { data: reviews = [] } = useCollection<Review>(reviewsQuery);
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

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [settingsForm, setSettingsForm] = useState<Partial<StoreSettings>>({});
  const [newCategoryName, setNewCategoryName] = useState('');

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', category: '', imageUrls: [], badges: [] });
    setIsEditing(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsProductSaving(false);
    setIsImageProcessing(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'Ali@AngryChickZ' && loginForm.password === 'AngryChickZ@DeebData#79') {
      setIsAuthenticated(true);
      toast({ title: "Authorized" });
    } else {
      toast({ variant: "destructive", title: "Denied" });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageProcessing(true);
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, imageUrls: [base64String] }));
      setPreviewUrl(base64String);
      setIsImageProcessing(false);
      toast({ title: "Image Prepared (Base64)" });
    };

    reader.onerror = () => {
      toast({ variant: "destructive", title: "Failed to read image" });
      setIsImageProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setIsProductSaving(true);
    const priceVal = parseFloat(formData.price || '0');
    
    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: priceVal,
      category: formData.category,
      imageUrls: formData.imageUrls,
      badges: formData.badges || [],
      isAvailable: true,
      updatedAt: serverTimestamp(),
    };

    try {
      if (isEditing) {
        await setDoc(doc(db, 'products', isEditing), productData, { merge: true });
        toast({ title: "Updated Successfully" });
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp(),
        });
        toast({ title: "Product Created" });
      }
      resetForm();
    } catch (err) {
      toast({ variant: "destructive", title: "Save Error" });
    } finally {
      setIsProductSaving(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name || !db) return;
    
    setIsCategoryAdding(true);
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    try {
      await addDoc(collection(db, 'categories'), { name, slug });
      setNewCategoryName(''); 
      toast({ title: "Category Added" });
    } catch (err) {
      toast({ variant: "destructive", title: "Add Error" });
    } finally {
      // Ensuring the spinner stops immediately
      setIsCategoryAdding(false);
    }
  };

  const deleteItem = async (id: string, coll: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, coll, id));
      toast({ title: "Deleted" });
    } catch (err) {
      toast({ variant: "destructive", title: "Delete Error" });
    }
  };

  const handleSeedData = async () => {
    if (!db) return;
    setIsSeeding(true);
    try {
      await Promise.all(MOCK_PRODUCTS.map(p => 
        addDoc(collection(db, 'products'), { ...p, isAvailable: true, createdAt: serverTimestamp() })
      ));
      toast({ title: "Data Seeded" });
    } finally {
      setIsSeeding(false);
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
            <CardTitle className="text-xl font-black text-zinc-100 uppercase italic tracking-tighter">Terminal Access</CardTitle>
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
               <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Global Sync Active</p>
             </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSeedData} disabled={isSeeding} variant="outline" className="h-10 border-amber-500/20 bg-amber-500/5 rounded-xl px-4 text-[9px] font-bold uppercase italic text-amber-500 hover:bg-amber-500 hover:text-black">
              {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Database className="h-4 w-4 mr-2" /> Seed Database</>}
            </Button>
            <Link href="/">
              <Button variant="outline" className="h-10 bg-zinc-800 border-zinc-700 rounded-xl px-4 font-bold uppercase italic text-[9px]">
                <ArrowLeft className="h-4 w-4 mr-2" /> View Portal
              </Button>
            </Link>
          </div>
        </header>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl h-auto w-full justify-start gap-1 flex-wrap">
            <TabsTrigger value="products" className="px-4 py-2 rounded-lg font-black text-[9px] uppercase italic data-[state=active]:bg-amber-500 data-[state=active]:text-black">Products</TabsTrigger>
            <TabsTrigger value="categories" className="px-4 py-2 rounded-lg font-black text-[9px] uppercase italic data-[state=active]:bg-amber-500 data-[state=active]:text-black">Categories</TabsTrigger>
            <TabsTrigger value="reviews" className="px-4 py-2 rounded-lg font-black text-[9px] uppercase italic data-[state=active]:bg-amber-500 data-[state=active]:text-black">Reviews</TabsTrigger>
            <TabsTrigger value="contact" className="px-4 py-2 rounded-lg font-black text-[9px] uppercase italic data-[state=active]:bg-amber-500 data-[state=active]:text-black">Branding</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="grid lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-5 bg-zinc-900 border-zinc-800 rounded-[2rem] shadow-xl h-fit overflow-hidden">
              <CardHeader className="bg-zinc-950/30 p-6 border-b border-zinc-800">
                <CardTitle className="text-lg font-black text-amber-500 uppercase italic">
                  {isEditing ? 'Modify Product' : 'Add New Item'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-zinc-500 uppercase">Product Name</Label>
                    <Input required value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-zinc-500 uppercase">Description</Label>
                    <Textarea 
                      required 
                      value={formData.description} 
                      onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} 
                      className="bg-zinc-800 border-zinc-700 rounded-xl min-h-[100px] text-xs font-bold" 
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
                    <Label className="text-[9px] font-black text-zinc-500 uppercase">Device Image</Label>
                    <div 
                      onClick={() => !isImageProcessing && fileInputRef.current?.click()}
                      className={`border-2 border-dashed border-zinc-700 rounded-xl p-6 flex flex-col items-center justify-center bg-zinc-800/30 cursor-pointer hover:border-amber-500 transition-all ${isImageProcessing ? 'opacity-50' : ''}`}
                    >
                      <input type="file" min="0" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                      {isImageProcessing ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-6 w-6 animate-spin text-amber-500 mb-2" />
                          <span className="text-[8px] font-black uppercase text-amber-500">Processing...</span>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="h-6 w-6 mb-2 text-zinc-500" />
                          <span className="text-[8px] font-black uppercase text-zinc-500">Pick from Phone</span>
                        </>
                      )}
                    </div>
                    {previewUrl && (
                      <div className="relative h-24 w-full rounded-xl overflow-hidden border border-amber-500/30">
                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => { setFormData(prev => ({ ...prev, imageUrls: [] })); setPreviewUrl(null); }} className="absolute top-2 right-2 bg-red-600/80 p-1 rounded-full backdrop-blur-md">
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isEditing && (
                      <Button type="button" onClick={resetForm} variant="outline" className="flex-1 h-12 bg-zinc-800 border-zinc-700 text-zinc-100 rounded-xl font-black uppercase italic text-xs">
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" disabled={isProductSaving || isImageProcessing} className="flex-[2] h-12 bg-amber-500 text-black font-black rounded-xl uppercase italic text-xs">
                       {isProductSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? 'Update Item' : 'Add to Cloud')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-3 rounded-[1.2rem] flex gap-3 items-center hover:bg-zinc-800 transition-colors">
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-zinc-800">
                    <img src={p.imageUrls?.[0] || 'https://picsum.photos/seed/food/200/200'} alt={p.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-black text-[10px] uppercase italic truncate">{p.name}</h4>
                    <span className="text-amber-500 text-[9px] font-black">${p.price.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setIsEditing(p.id); setFormData({ ...p, price: p.price.toString() }); setPreviewUrl(p.imageUrls[0]); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1.5 text-zinc-500 hover:text-white"><Edit2 className="h-3 w-3" /></button>
                    <button onClick={() => deleteItem(p.id, 'products')} className="p-1.5 text-zinc-500 hover:text-red-500">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="max-w-xl mx-auto space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 rounded-[2rem] p-8">
              <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 mb-6">
                <Input required placeholder="Category Name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="bg-zinc-800 border-zinc-700 h-12 rounded-xl flex-grow font-bold" />
                <Button type="submit" disabled={isCategoryAdding} className="bg-amber-500 text-black rounded-xl font-black px-8 h-12 uppercase italic text-[10px]">
                  {isCategoryAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Category'}
                </Button>
              </form>
              <div className="grid gap-2">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-zinc-800/30 border border-zinc-800 rounded-xl">
                    <span className="font-black text-[9px] uppercase italic text-zinc-300">{cat.name}</span>
                    <button onClick={() => deleteItem(cat.id, 'categories')} className="text-zinc-600 hover:text-red-500">
                       <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="max-w-4xl mx-auto space-y-6">
             <div className="grid gap-4">
               {reviews.map(review => (
                 <Card key={review.id} className="bg-zinc-900 border-zinc-800 rounded-2xl overflow-hidden">
                   <CardContent className="p-6 flex justify-between items-start">
                     <div className="space-y-2">
                       <div className="flex items-center gap-2">
                         <span className="font-black text-amber-500 uppercase italic text-sm">{review.customerName}</span>
                         <div className="flex gap-0.5">
                           {Array.from({ length: review.rating }).map((_, i) => (
                             <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                           ))}
                         </div>
                       </div>
                       <p className="text-zinc-400 text-xs font-medium italic">"{review.comment}"</p>
                       <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">
                         {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'New Feedback'}
                       </span>
                     </div>
                     <button onClick={() => deleteItem(review.id!, 'reviews')} className="text-zinc-600 hover:text-red-500 p-2">
                       <Trash2 className="h-4 w-4" />
                     </button>
                   </CardContent>
                 </Card>
               ))}
             </div>
          </TabsContent>

          <TabsContent value="contact" className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 rounded-[2rem] p-8">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black text-zinc-500 uppercase">Logo URL</Label>
                    <Input placeholder="https://..." value={settingsForm.logo || storeSettings?.logo || ''} onChange={e => setSettingsForm(s => ({ ...s, logo: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                 </div>
                 <div className="grid sm:grid-cols-2 gap-4">
                    <Input placeholder="WhatsApp" value={settingsForm.whatsappNumber || storeSettings?.whatsappNumber || ''} onChange={e => setSettingsForm(s => ({ ...s, whatsappNumber: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                    <Input placeholder="Support Phone" value={settingsForm.phone || storeSettings?.phone || ''} onChange={e => setSettingsForm(s => ({ ...s, phone: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                 </div>
                 <Input placeholder="Store Address" value={settingsForm.address || storeSettings?.address || ''} onChange={e => setSettingsForm(s => ({ ...s, address: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                 <div className="grid sm:grid-cols-3 gap-4">
                    <Input placeholder="TikTok" value={settingsForm.tiktok || storeSettings?.tiktok || ''} onChange={e => setSettingsForm(s => ({ ...s, tiktok: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                    <Input placeholder="Instagram" value={settingsForm.instagram || storeSettings?.instagram || ''} onChange={e => setSettingsForm(s => ({ ...s, instagram: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                    <Input placeholder="Facebook" value={settingsForm.facebook || storeSettings?.facebook || ''} onChange={e => setSettingsForm(s => ({ ...s, facebook: e.target.value }))} className="bg-zinc-800 border-zinc-700 h-11 rounded-xl" />
                 </div>
                 <Button onClick={async () => { if(!db) return; await setDoc(doc(db, 'settings', 'store'), { ...storeSettings, ...settingsForm }, { merge: true }); toast({title: "Settings Saved"}); }} className="w-full h-12 bg-amber-500 text-black font-black rounded-xl uppercase italic shadow-lg">Save Settings</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
