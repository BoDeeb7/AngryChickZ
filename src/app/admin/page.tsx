
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
import { Plus, Trash2, Edit2, Upload, X, Loader2, Flame, ShieldAlert, Zap, LayoutDashboard } from 'lucide-react';
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
        const storageRef = ref(storage, `menu-assets/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      }));
      
      setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...newUrls] }));
      toast({ title: "INTEL CAPTURED", description: `${newUrls.length} assets uploaded.` });
    } catch (error) {
      toast({ variant: "destructive", title: "UPLOAD FAILED" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!productsRef) return;
    if (!formData.name || !formData.price || !formData.category) {
      toast({ variant: "destructive", title: "CRITICAL ERROR", description: "Missing mandatory product data." });
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
        toast({ title: "ASSET MODIFIED", description: "Remote sync complete." });
      } else {
        await addDoc(productsRef, data);
        toast({ title: "ASSET DEPLOYED", description: "New item is now active." });
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
    if (!confirm('TERMINATE THIS ASSET PERMANENTLY?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "ASSET TERMINATED" });
    } catch (e) { console.error(e); }
  };

  const handleAddCategory = async () => {
    if (!categoriesRef || !newCategory.name) return;
    try {
      await addDoc(categoriesRef, { 
        ...newCategory, 
        slug: newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, '-') 
      });
      setNewCategory({ name: '', slug: '' });
      toast({ title: "NEW SECTOR ONLINE" });
    } catch (e) { console.error(e); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast({ title: "SECTOR OFFLINE" });
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
    <div className="min-h-screen bg-[#0F0F12] text-white selection:bg-red-600/30">
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="ambient-orb w-[600px] h-[600px] bg-red-600/10 top-[-200px] right-[-100px]" />
        <div className="ambient-orb w-[400px] h-[400px] bg-yellow-600/5 bottom-[10%] left-[5%]" />
      </div>
      
      <div className="container mx-auto px-6 py-20">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-20">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-red-600">
               <ShieldAlert className="h-8 w-8 animate-pulse" />
               <span className="font-black uppercase tracking-[0.5em] text-xs">Command Terminal Alpha</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-black italic uppercase tracking-tighter leading-none">
              Strategic <span className="text-glow-red text-red-600">Control</span>
            </h1>
            <div className="flex items-center gap-4 pt-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
              <p className="font-bold text-white/30 uppercase text-xs tracking-[0.4em]">Satellite Uplink Active</p>
            </div>
          </div>
          <Button variant="outline" className="h-20 px-12 rounded-[2rem] border-white/10 glass-panel text-white font-black uppercase italic tracking-tighter text-xl hover:bg-white/10" asChild>
            <a href="/">Exit To Public View</a>
          </Button>
        </header>

        <Tabs defaultValue="inventory" className="space-y-16">
          <TabsList className="glass-panel rounded-[2.5rem] h-24 p-3 flex gap-3 w-full lg:w-fit">
            <TabsTrigger value="inventory" className="flex-1 lg:px-12 rounded-[2rem] h-full font-black uppercase italic tracking-tighter text-2xl data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all duration-500">
              <Zap className="h-6 w-6 mr-3" /> Inventory
            </TabsTrigger>
            <TabsTrigger value="sectors" className="flex-1 lg:px-12 rounded-[2rem] h-full font-black uppercase italic tracking-tighter text-2xl data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all duration-500">
              <LayoutDashboard className="h-6 w-6 mr-3" /> Sectors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="grid lg:grid-cols-3 gap-16 items-start">
            <Card className="rounded-[4rem] glass-panel border-none animate-in fade-in slide-in-from-left duration-700">
              <CardHeader className="p-12 border-b border-white/5">
                <CardTitle className="uppercase italic font-black text-4xl tracking-tighter flex items-center gap-5">
                  <Plus className="h-10 w-10 text-red-600" />
                  {isEditing ? 'Modify Intel' : 'New Asset'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-12 space-y-10">
                <div className="space-y-4">
                  <Label className="font-black uppercase text-xs tracking-[0.3em] text-white/30">Asset Identity</Label>
                  <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="h-20 rounded-[1.5rem] bg-white/5 border-white/10 font-black uppercase italic tracking-tighter text-2xl px-8 focus:ring-red-600" placeholder="ASSET NAME..." />
                </div>
                <div className="space-y-4">
                  <Label className="font-black uppercase text-xs tracking-[0.3em] text-white/30">Strategic Intelligence</Label>
                  <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} className="min-h-40 rounded-[2rem] bg-white/5 border-white/10 font-bold p-8 text-white/50 text-xl focus:ring-red-600" placeholder="DETAILED INTEL..." />
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="font-black uppercase text-xs tracking-[0.3em] text-white/30">Value ($)</Label>
                    <Input type="number" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} className="h-20 rounded-[1.5rem] bg-white/5 border-white/10 font-black uppercase italic tracking-tighter text-2xl px-8" placeholder="0.00" />
                  </div>
                  <div className="space-y-4">
                    <Label className="font-black uppercase text-xs tracking-[0.3em] text-white/30">Sector</Label>
                    <select 
                      className="w-full h-20 px-8 bg-white/5 border border-white/10 rounded-[1.5rem] outline-none font-black uppercase italic tracking-tighter text-2xl focus:ring-2 focus:ring-red-600 appearance-none"
                      value={formData.category}
                      onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    >
                      <option value="" className="bg-[#0F0F12]">SELECT...</option>
                      {categories.map(c => <option key={c.id} value={c.slug} className="bg-[#0F0F12]">{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <Label className="font-black uppercase text-xs tracking-[0.3em] text-white/30">Classification Badges</Label>
                  <div className="flex flex-wrap gap-3">
                    {['Spicy', 'Best Seller', 'New', 'Elite', 'Trending'].map(badge => (
                      <button
                        key={badge}
                        onClick={() => setFormData(f => ({
                          ...f,
                          badges: f.badges.includes(badge) ? f.badges.filter(b => b !== badge) : [...f.badges, badge]
                        }))}
                        className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${formData.badges.includes(badge) ? 'bg-red-600 text-white shadow-xl' : 'bg-white/5 text-white/30 border border-white/10'}`}
                      >
                        {badge}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <Label className="font-black uppercase text-xs tracking-[0.3em] text-white/30">Visual Recon (Multi-Upload)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {formData.imageUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-[1.5rem] overflow-hidden glass-panel group">
                        <Image src={url} alt="preview" fill className="object-cover" />
                        <button 
                          onClick={() => setFormData(f => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }))}
                          className="absolute inset-0 bg-red-600/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-8 w-8" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square flex flex-col items-center justify-center glass-panel rounded-[1.5rem] cursor-pointer hover:bg-white/10 transition-all border-dashed border-white/20">
                      {isUploading ? <Loader2 className="h-10 w-10 animate-spin text-red-600" /> : <Upload className="h-10 w-10 text-white/30" />}
                      <span className="text-[10px] font-black uppercase mt-3 text-white/20 tracking-widest">Add Asset</span>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                </div>

                <div className="flex gap-6 pt-10">
                  <Button onClick={handleSaveProduct} className="flex-grow h-24 rounded-[2.5rem] bg-red-600 hover:bg-red-700 text-3xl font-black italic uppercase tracking-tighter btn-glow-red transition-all">
                    {isEditing ? 'Sync Changes' : 'Deploy Asset'}
                  </Button>
                  {isEditing && (
                    <Button variant="ghost" onClick={resetForm} className="h-24 px-10 rounded-[2.5rem] glass-panel font-black uppercase italic tracking-tighter text-white">
                      Abort
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-12 animate-in fade-in slide-in-from-right duration-700">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-6">
                <Flame className="h-10 w-10 text-red-600 animate-pulse" />
                Active Deployment Grid
              </h2>
              <div className="grid sm:grid-cols-2 gap-8">
                {products.map(product => (
                  <div key={product.id} className="glass-card p-8 rounded-[3rem] flex gap-8 group hover:scale-[1.02] transition-all">
                    <div className="relative h-32 w-32 rounded-[2rem] overflow-hidden glass-panel shrink-0 shadow-2xl">
                      <Image src={product.imageUrls[0] || 'https://picsum.photos/seed/food/300/300'} alt={product.name} fill className="object-cover group-hover:scale-125 transition-transform duration-1000" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-2">
                      <div>
                        <h4 className="font-black text-2xl uppercase italic tracking-tighter leading-none group-hover:text-red-500 transition-colors">{product.name}</h4>
                        <p className="text-xs text-white/30 font-bold mt-3 uppercase tracking-[0.3em]">{product.category}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="font-black text-3xl italic tracking-tighter text-glow-red">${product.price.toFixed(2)}</span>
                        <div className="flex gap-3">
                          <Button size="icon" variant="ghost" className="h-14 w-14 rounded-[1.5rem] glass-panel hover:bg-white/10" onClick={() => startEdit(product)}>
                            <Edit2 className="h-6 w-6" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-14 w-14 rounded-[1.5rem] glass-panel text-red-600 hover:bg-red-600/10" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sectors" className="max-w-4xl animate-in fade-in zoom-in duration-700">
            <Card className="rounded-[4rem] glass-panel border-none">
              <CardHeader className="p-12 border-b border-white/5">
                <CardTitle className="uppercase italic font-black text-4xl tracking-tighter">Strategic Sectors</CardTitle>
              </CardHeader>
              <CardContent className="p-12 space-y-12">
                <div className="flex gap-6">
                  <div className="flex-grow space-y-3">
                    <Input 
                      placeholder="NEW SECTOR IDENTITY" 
                      value={newCategory.name} 
                      onChange={e => setNewCategory(c => ({ ...c, name: e.target.value }))}
                      className="h-24 rounded-[2rem] bg-white/5 border-white/10 font-black uppercase italic tracking-tighter text-3xl px-10 focus:ring-red-600"
                    />
                  </div>
                  <Button onClick={handleAddCategory} className="h-24 w-24 rounded-[2rem] bg-red-600 hover:bg-red-700 btn-glow-red">
                    <Plus className="h-10 w-10" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-8 glass-card rounded-[2.5rem] group">
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-red-600/20 flex items-center justify-center group-hover:bg-red-600/40 transition-all">
                          <Zap className="h-8 w-8 text-red-600 fill-red-600" />
                        </div>
                        <span className="font-black uppercase italic tracking-tighter text-2xl">{cat.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-16 w-16 rounded-[1.5rem] text-red-600 hover:bg-red-600/10" onClick={() => handleDeleteCategory(cat.id)}>
                        <Trash2 className="h-8 w-8" />
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
