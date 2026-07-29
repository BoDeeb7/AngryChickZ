'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product, Category } from '@/types/restaurant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit2, Upload, X, Loader2, Flame, ShieldAlert, Zap } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminPage() {
  const db = useFirestore();
  const storage = getStorage();
  const { toast } = useToast();
  
  const productsRef = useMemo(() => db ? collection(db, 'products') : null, [db]);
  const categoriesRef = useMemo(() => db ? collection(db, 'categories') : null, [db]);

  const { data: products = [] } = useCollection<Product>(productsRef);
  const { data: categories = [] } = useCollection<Category>(categoriesRef);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    
    try {
      const files = Array.from(e.target.files);
      const newUrls = await Promise.all(files.map(async (file) => {
        const storageRef = ref(storage, `menu-items/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      }));
      
      setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...newUrls] }));
      toast({ title: "Images Uploaded", description: `Successfully added ${newUrls.length} file(s).` });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload files." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!productsRef) return;
    if (!formData.name || !formData.price || !formData.category) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill all required fields." });
      return;
    }
    
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      createdAt: serverTimestamp(),
    };

    try {
      if (isEditing) {
        await updateDoc(doc(db, 'products', isEditing), data);
        toast({ title: "Intelligence Updated", description: "Item data synchronized." });
      } else {
        await addDoc(productsRef, data);
        toast({ title: "Deployment Successful", description: "New item is active on the menu." });
      }
      resetForm();
    } catch (e: any) {
      const err = new FirestorePermissionError({
        path: 'products',
        operation: isEditing ? 'update' : 'create',
        requestResourceData: data
      });
      errorEmitter.emit('permission-error', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!db) return;
    if (!confirm('Are you sure you want to terminate this item?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "Item Terminated", description: "Item removed from active service." });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCategory = async () => {
    if (!categoriesRef || !newCategory.name) return;
    try {
      await addDoc(categoriesRef, { 
        ...newCategory, 
        slug: newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, '-') 
      });
      setNewCategory({ name: '', slug: '' });
      toast({ title: "New Sector Established" });
    } catch (e) { console.error(e); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast({ title: "Sector Decommissioned" });
    } catch (e) { console.error(e); }
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
      imageUrls: product.imageUrls,
      badges: product.badges || [],
    });
    setIsEditing(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      <div className="fixed top-0 left-0 w-full h-[300px] bg-red-600/10 blur-[150px] -z-10" />
      
      <div className="container mx-auto px-6 pt-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-600">
               <ShieldAlert className="h-6 w-6" />
               <span className="font-black uppercase tracking-[0.4em] text-xs">Command Center</span>
            </div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
              Operation <span className="text-glow-red text-red-600">Angry</span>
            </h1>
            <p className="font-bold text-white/40 uppercase text-xs tracking-[0.5em]">Hassan Deeb - Deeb Data Systems</p>
          </div>
          <Button variant="outline" className="h-16 px-10 rounded-3xl border-white/10 glass-panel text-white font-black uppercase italic tracking-tighter text-lg hover:bg-white/5" asChild>
            <a href="/">Exit To Public View</a>
          </Button>
        </div>

        <Tabs defaultValue="products" className="space-y-12">
          <TabsList className="glass-panel rounded-3xl h-20 p-2 flex gap-2">
            <TabsTrigger value="products" className="flex-1 rounded-2xl h-full font-black uppercase italic tracking-tighter text-xl data-[state=active]:bg-red-600 data-[state=active]:text-white">Active Menu</TabsTrigger>
            <TabsTrigger value="categories" className="flex-1 rounded-2xl h-full font-black uppercase italic tracking-tighter text-xl data-[state=active]:bg-red-600 data-[state=active]:text-white">Sectors</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="grid lg:grid-cols-3 gap-12 items-start">
            <Card className="rounded-[3rem] glass-panel border-none">
              <CardHeader className="p-10 border-b border-white/10">
                <CardTitle className="uppercase italic font-black text-3xl tracking-tighter flex items-center gap-4">
                  <Plus className="h-8 w-8 text-red-600" />
                  {isEditing ? 'Modify Intel' : 'New Asset'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="space-y-3">
                  <Label className="font-black uppercase text-[10px] tracking-widest text-white/40">Product Identity</Label>
                  <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="h-14 rounded-2xl bg-white/5 border-white/10 font-black uppercase italic tracking-tighter text-lg" placeholder="ITEM NAME" />
                </div>
                <div className="space-y-3">
                  <Label className="font-black uppercase text-[10px] tracking-widest text-white/40">Intelligence / Description</Label>
                  <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} className="min-h-32 rounded-3xl bg-white/5 border-white/10 font-bold p-6 text-white/60" placeholder="ITEM DETAILS..." />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="font-black uppercase text-[10px] tracking-widest text-white/40">Market Value ($)</Label>
                    <Input type="number" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} className="h-14 rounded-2xl bg-white/5 border-white/10 font-black uppercase italic tracking-tighter text-lg" placeholder="0.00" />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-black uppercase text-[10px] tracking-widest text-white/40">Assigned Sector</Label>
                    <select 
                      className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl outline-none font-black uppercase italic tracking-tighter text-lg"
                      value={formData.category}
                      onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    >
                      <option value="" className="bg-black">SELECT...</option>
                      {categories.map(c => <option key={c.id} value={c.slug} className="bg-black">{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="font-black uppercase text-[10px] tracking-widest text-white/40">Classification Badges</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Spicy', 'Best Seller', 'New', 'Elite'].map(badge => (
                      <button
                        key={badge}
                        onClick={() => setFormData(f => ({
                          ...f,
                          badges: f.badges.includes(badge) ? f.badges.filter(b => b !== badge) : [...f.badges, badge]
                        }))}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.badges.includes(badge) ? 'bg-red-600 text-white border-red-400' : 'bg-white/5 text-white/40 border border-white/10'}`}
                      >
                        {badge}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="font-black uppercase text-[10px] tracking-widest text-white/40">Visual Recon (Multiple Photos)</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {formData.imageUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden glass-panel">
                        <Image src={url} alt="preview" fill className="object-cover" />
                        <button 
                          onClick={() => setFormData(f => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }))}
                          className="absolute top-2 right-2 bg-black/80 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square flex flex-col items-center justify-center glass-panel rounded-2xl cursor-pointer hover:bg-white/10 transition-all border-dashed">
                      {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-red-600" /> : <Upload className="h-6 w-6 text-white/40" />}
                      <span className="text-[8px] font-black uppercase mt-2 text-white/20">UPLOAD</span>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button onClick={handleSaveProduct} className="flex-grow h-20 rounded-[2rem] bg-red-600 hover:bg-red-700 text-xl font-black italic uppercase tracking-tighter btn-glow-red transition-all">
                    {isEditing ? 'Confirm Update' : 'Initialize Asset'}
                  </Button>
                  {isEditing && (
                    <Button variant="ghost" onClick={resetForm} className="h-20 px-8 rounded-[2rem] glass-panel font-black uppercase italic tracking-tighter text-white">
                      Abort
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-10">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4">
                <Zap className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                Active Inventory
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {products.map(product => (
                  <div key={product.id} className="glass-card p-6 rounded-[2.5rem] flex gap-6 group">
                    <div className="relative h-28 w-28 rounded-2xl overflow-hidden glass-panel flex-shrink-0">
                      <Image src={product.imageUrls[0] || 'https://picsum.photos/seed/food/200/200'} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-black text-xl uppercase italic tracking-tighter leading-none group-hover:text-red-500 transition-colors">{product.name}</h4>
                        <p className="text-xs text-white/40 font-bold mt-2 uppercase tracking-widest">{product.category}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-2xl italic tracking-tighter text-glow-red">${product.price.toFixed(2)}</span>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl glass-panel hover:bg-white/10" onClick={() => startEdit(product)}>
                            <Edit2 className="h-5 w-5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl glass-panel text-red-600 hover:bg-red-600/10" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="max-w-2xl">
            <Card className="rounded-[3rem] glass-panel border-none">
              <CardHeader className="p-10 border-b border-white/10">
                <CardTitle className="uppercase italic font-black text-3xl tracking-tighter">Sector Management</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="flex gap-4">
                  <div className="flex-grow space-y-2">
                    <Input 
                      placeholder="NEW SECTOR NAME" 
                      value={newCategory.name} 
                      onChange={e => setNewCategory(c => ({ ...c, name: e.target.value }))}
                      className="h-16 rounded-2xl bg-white/5 border-white/10 font-black uppercase italic tracking-tighter text-lg px-6"
                    />
                  </div>
                  <Button onClick={handleAddCategory} className="h-16 w-16 rounded-2xl bg-red-600 hover:bg-red-700 btn-glow-red">
                    <Plus className="h-8 w-8" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-6 glass-card rounded-[2rem]">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-red-600/20 flex items-center justify-center">
                          <Flame className="h-6 w-6 text-red-600 fill-red-600" />
                        </div>
                        <span className="font-black uppercase italic tracking-tighter text-xl">{cat.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-red-600 hover:bg-red-600/10" onClick={() => handleDeleteCategory(cat.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}