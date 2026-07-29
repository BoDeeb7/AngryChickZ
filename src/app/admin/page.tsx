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
import { Plus, Trash2, Edit2, Upload, Loader2, LayoutGrid, List, Utensils, ShieldCheck, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';

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
        const storageRef = ref(storage, `menu/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      }));
      
      setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...newUrls] }));
      toast({ title: "Assets Uploaded", description: `${newUrls.length} files stored securely.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Storage Failure" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!productsRef) return;
    if (!formData.name || !formData.price || !formData.category) {
      toast({ variant: "destructive", title: "Incomplete Protocol", description: "Required fields missing." });
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
        toast({ title: "Module Updated" });
      } else {
        await addDoc(productsRef, data);
        toast({ title: "New Item Deployed" });
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
    if (!confirm('Authorize permanent removal of this menu asset?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "Asset Purged" });
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
      toast({ title: "Sector Added" });
    } catch (e) { console.error(e); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast({ title: "Sector Removed" });
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
    <div className="min-h-screen bg-[#050607] text-white p-8 md:p-16">
      <div className="container mx-auto max-w-7xl">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-20">
          <div className="flex items-center gap-8">
            <div className="h-16 w-16 glass-panel rounded-2xl flex items-center justify-center border-red-600/30">
              <ShieldCheck className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic italic leading-none">Management Center</h1>
              <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.5em] mt-3">Executive Menu Oversight Terminal</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="h-16 px-10 rounded-2xl border-white/5 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest gap-3">
              <ArrowLeft className="h-4 w-4" /> Return to Storefront
            </Button>
          </Link>
        </header>

        <Tabs defaultValue="products" className="space-y-12">
          <TabsList className="bg-white/5 border border-white/5 p-2 rounded-3xl h-20 gap-2">
            <TabsTrigger value="products" className="px-12 rounded-2xl h-full font-black uppercase italic tracking-widest data-[state=active]:bg-red-600 text-xs">
              <LayoutGrid className="h-4 w-4 mr-3" /> Inventory
            </TabsTrigger>
            <TabsTrigger value="categories" className="px-12 rounded-2xl h-full font-black uppercase italic tracking-widest data-[state=active]:bg-red-600 text-xs">
              <List className="h-4 w-4 mr-3" /> Menu Sectors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="grid lg:grid-cols-12 gap-16 items-start">
            <Card className="lg:col-span-4 bg-white/5 border-white/5 rounded-[2.5rem] overflow-hidden glass-panel">
              <CardHeader className="p-10 border-b border-white/5">
                <CardTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-4">
                  {isEditing ? <Edit2 className="h-6 w-6 text-red-600" /> : <Plus className="h-6 w-6 text-red-600" />}
                  {isEditing ? 'Modify Asset' : 'New Asset Entry'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-red-600/60 uppercase tracking-[0.3em]">Item Designation</Label>
                  <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="bg-black/40 border-white/5 rounded-2xl h-14 font-bold" placeholder="Asset Name" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-red-600/60 uppercase tracking-[0.3em]">Flavor Profile</Label>
                  <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} className="bg-black/40 border-white/5 rounded-2xl min-h-[140px] font-bold" placeholder="Technical specifications..." />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-red-600/60 uppercase tracking-[0.3em]">Price Unit ($)</Label>
                    <Input type="number" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} className="bg-black/40 border-white/5 rounded-2xl h-14 font-bold" placeholder="0.00" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-red-600/60 uppercase tracking-[0.3em]">Sector</Label>
                    <select 
                      className="w-full h-14 px-4 bg-black/40 border border-white/5 rounded-2xl outline-none font-bold text-sm uppercase tracking-widest"
                      value={formData.category}
                      onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    >
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c.id} value={c.slug} className="bg-[#1a1b1f]">{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <Label className="text-[10px] font-black text-red-600/60 uppercase tracking-[0.3em]">Visual Assets</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {formData.imageUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden glass-panel group">
                        <Image src={url} alt="preview" fill className="object-cover" />
                        <button 
                          onClick={() => setFormData(f => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }))}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-6 w-6" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square flex flex-col items-center justify-center bg-black/40 rounded-2xl cursor-pointer hover:bg-black/60 transition-all border-2 border-dashed border-white/10 hover:border-red-600/50">
                      {isUploading ? <Loader2 className="h-8 w-8 animate-spin text-red-600" /> : <Upload className="h-8 w-8 text-white/20 group-hover:text-red-600" />}
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                </div>

                <div className="flex gap-6 pt-6">
                  <Button onClick={handleSaveProduct} className="flex-grow h-20 bg-red-600 hover:bg-red-700 rounded-[1.5rem] font-black uppercase italic text-lg shadow-2xl">
                    {isEditing ? 'Apply Changes' : 'Initialize Asset'}
                  </Button>
                  {isEditing && (
                    <Button variant="ghost" onClick={resetForm} className="h-20 rounded-[1.5rem] border border-white/5 px-8">
                      <Trash2 className="h-6 w-6" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-8 space-y-10">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-6">
                <Utensils className="h-8 w-8 text-red-600" /> Active Inventory Stream
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {products.map(product => (
                  <div key={product.id} className="glass-card p-6 rounded-3xl flex gap-8 group border-white/5">
                    <div className="relative h-32 w-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl">
                      <Image src={product.imageUrls[0] || 'https://picsum.photos/seed/food/200/200'} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-2">
                      <div>
                        <h4 className="font-black text-xl leading-tight mb-2 uppercase italic tracking-tighter">{product.name}</h4>
                        <p className="text-[9px] text-red-600 font-black uppercase tracking-[0.4em]">{product.category}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-2xl text-white italic tracking-tighter">${product.price.toFixed(2)}</span>
                        <div className="flex gap-3">
                          <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl bg-white/5 hover:bg-white/10" onClick={() => startEdit(product)}>
                            <Edit2 className="h-5 w-5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl text-red-600 bg-red-600/5 hover:bg-red-600/20" onClick={() => handleDeleteProduct(product.id)}>
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

          <TabsContent value="categories" className="max-w-3xl">
            <Card className="bg-white/5 border-white/5 rounded-[2.5rem] overflow-hidden glass-panel">
              <CardHeader className="p-10 border-b border-white/5">
                <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Inventory Sectors</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="flex gap-6">
                  <Input 
                    placeholder="Sector Designation" 
                    value={newCategory.name} 
                    onChange={e => setNewCategory(c => ({ ...c, name: e.target.value }))}
                    className="h-16 bg-black/40 border-white/5 rounded-2xl font-black text-sm"
                  />
                  <Button onClick={handleAddCategory} className="h-16 w-16 rounded-2xl bg-red-600 hover:bg-red-700 shadow-2xl">
                    <Plus className="h-8 w-8" />
                  </Button>
                </div>

                <div className="grid gap-4">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-6 bg-black/40 border border-white/5 rounded-2xl group hover:border-red-600/30 transition-all">
                      <span className="font-black uppercase tracking-[0.2em] text-xs">{cat.name}</span>
                      <Button variant="ghost" size="icon" className="h-12 w-12 text-red-600 hover:bg-red-600/10" onClick={() => handleDeleteCategory(cat.id)}>
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