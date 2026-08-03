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
  Star,
  MessageSquare
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, Category, StoreSettings, Review } from '@/types/restaurant';
import { useFirestore, useCollection, useDoc, useStorage } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
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
    setIsImageUploading(false);
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

  // UPLOAD IMAGE IMMEDIATELY UPON SELECTION
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    // 1. Local Preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    
    // 2. Immediate Cloud Upload
    setIsImageUploading(true);
    try {
      const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const cloudUrl = await getDownloadURL(snapshot.ref);
      
      if (cloudUrl) {
        setFormData(prev => ({ ...prev, imageUrls: [cloudUrl] }));
        setPreviewUrl(cloudUrl); // Switch to permanent URL
        toast({ title: "Image Uploaded Successfully" });
      }
    } catch (uploadError) {
      console.error("Image upload failed:", uploadError);
      toast({ 
        variant: "destructive", 
        title: "Upload Failed", 
        description: "Could not save image to cloud. Try again." 
      });
      setPreviewUrl(null);
    } finally {
      setIsImageUploading(false);
    }
  };

  // SAVE PRODUCT (NO IMAGE LOGIC HERE)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    // Safety check: Don't submit if an image is still mid-upload
    if (isImageUploading) {
      toast({ title: "Wait...", description: "Image is still uploading to cloud." });
      return;
    }

    setIsProductSaving(true);

    try {
      // 1. Prepare Data
      const priceVal = parseFloat(formData.price || '0');
      const finalImage = formData.imageUrls[0] || 'https://picsum.photos/seed/food/800/800';
      
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: priceVal,
        category: formData.category,
        imageUrls: [finalImage],
        badges: formData.badges || [],
        isAvailable: true,
        updatedAt: serverTimestamp(),
      };

      // 2. Write to Firestore
      if (isEditing) {
        const docRef = doc(db, 'products', isEditing);
        await setDoc(docRef, productData, { merge: true });
      } else {
        const collRef = collection(db, 'products');
        await addDoc(collRef, {
          ...productData,
          createdAt: serverTimestamp(),
        });
      }
      
      // 3. Success Cleanup
      resetForm();
      toast({ title: isEditing ? "Product Updated" : "Product Created" });
    } catch (err) {
      console.error("Save failed:", err);
      toast({ 
        variant: "destructive", 
        title: "Save Failed", 
        description: "Firestore connection error. Please try again." 
      });
    } finally {
      setIsProductSaving(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName || !db) return;
    setIsCategoryAdding(true);
    
    try {
      const slug = newCategoryName.toLowerCase().trim().replace(/\s+/g, '-');
      const categoryData = { name: newCategoryName.trim(), slug };
      const collRef = collection(db, 'categories');
      
      await addDoc(collRef, categoryData);
      setNewCategoryName('');
      toast({ title: "Category Added" });
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to Add Category" });
    } finally {
      setIsCategoryAdding(false);
    }
  };

  const deleteItem = async (id: string, coll: string) => {
    if (!db) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, coll, id));
      toast({ title: "Deleted Successfully" });
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
            <Button onClick={() => { setIsSeeding(true); Promise.all(MOCK_PRODUCTS.map(p => addDoc(collection(db!, 'products'), { ...p, isAvailable: true, createdAt: serverTimestamp() }))).finally(() => setIsSeeding(false)); }} disabled={isSeeding} variant="outline" className="h-10 border-amber-500/20 bg-amber-500/5 rounded-xl px-4 text-[9px] font-bold uppercase italic text-amber-500 hover:bg-amber-500 hover:text-black">
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
            <TabsTrigger value="reviews" className="px-4 py-2 rounded-lg font-black text-[9px] uppercase italic data-[state=active]:bg-amber-500 data-[state=active]:text-black">Reviews</TabsTrigger>
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
                    <Label className="text-[9px] font-black text-zinc-500 uppercase">Media Preview</Label>
                    <div 
                      onClick={() => !isImageUploading && fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center bg-zinc-800/30 cursor-pointer transition-all ${isImageUploading ? 'opacity-50 border-amber-500' : 'border-zinc-700 hover:border-amber-500'}`}
                    >
                      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                      {isImageUploading ? <Loader2 className="h-6 w-6 mb-2 animate-spin text-amber-500" /> : <UploadCloud className="h-6 w-6 mb-2 text-zinc-500" />}
                      <span className="text-[8px] font-black uppercase text-zinc-500">{isImageUploading ? 'Uploading to Cloud...' : 'Click to Browse Image'}</span>
                    </div>
                    {previewUrl && (
                      <div className="relative h-24 w-full rounded-xl overflow-hidden border border-amber-500/30">
                        <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                        <button type="button" onClick={() => { setFormData(prev => ({ ...prev, imageUrls: [] })); setPreviewUrl(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-2 right-2 bg-red-600/80 p-1 rounded-full backdrop-blur-md">
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
                    <Button disabled={isProductSaving || isImageUploading} type="submit" className="flex-[2] h-12 bg-amber-500 text-black font-black rounded-xl uppercase italic text-xs">
                      {isProductSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? 'Update Global Item' : 'Add to Cloud')}
                    </Button>
                  </div>
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
                    <button onClick={() => { setIsEditing(p.id); setFormData({ ...p, price: p.price.toString() }); setPreviewUrl(p.imageUrls[0]); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1.5 text-zinc-500 hover:text-white"><Edit2 className="h-3 w-3" /></button>
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
              <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 mb-6">
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
                         {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Just now'}
                       </span>
                     </div>
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       onClick={() => deleteItem(review.id!, 'reviews')}
                       className="text-zinc-600 hover:text-red-500"
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </CardContent>
                 </Card>
               ))}
               {reviews.length === 0 && (
                 <div className="text-center py-20 opacity-20">
                   <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                   <p className="text-xl font-black uppercase italic">No Reviews Yet</p>
                 </div>
               )}
             </div>
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
                 <Button onClick={async () => { if(!db) return; await setDoc(doc(db, 'settings', 'store'), { ...storeSettings, ...settingsForm }, { merge: true }); toast({title: "Branding Updated"}); }} className="w-full h-12 bg-amber-500 text-black font-black rounded-xl uppercase italic shadow-lg">Update Profile</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}