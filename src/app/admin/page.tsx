'use client';

import { useState, useMemo, useEffect } from 'react';
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
      toast({ title: "Images Uploaded", description: "Visual assets secured." });
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!productsRef) return;
    if (!formData.name || !formData.price || !formData.category) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please complete the recipe." });
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
        toast({ title: "Menu Item Updated" });
      } else {
        await addDoc(productsRef, data);
        toast({ title: "New Item Created" });
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
    if (!confirm('Permanently remove this item?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "Item Removed" });
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
      toast({ title: "Category Added" });
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
    <div className="min-h-screen bg-[#FFFBEB] p-8 md:p-16">
      <div className="container mx-auto max-w-7xl">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-20">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-xl">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none text-foreground">Menu Dashboard</h1>
              <p className="text-primary font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Executive Management Portal</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="h-16 px-10 rounded-[1.5rem] border-amber-500/20 hover:bg-white text-[11px] font-black uppercase tracking-widest gap-3 shadow-sm">
              <ArrowLeft className="h-4 w-4" /> Storefront
            </Button>
          </Link>
        </header>

        <Tabs defaultValue="products" className="space-y-12">
          <TabsList className="bg-amber-500/5 p-2 rounded-[2rem] h-20 gap-2 border border-amber-500/10">
            <TabsTrigger value="products" className="px-10 rounded-full h-full font-black uppercase italic tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white text-xs">
              <Utensils className="h-4 w-4 mr-3" /> Inventory
            </TabsTrigger>
            <TabsTrigger value="categories" className="px-10 rounded-full h-full font-black uppercase italic tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white text-xs">
              <List className="h-4 w-4 mr-3" /> Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="grid lg:grid-cols-12 gap-16">
            <Card className="lg:col-span-5 glass-card rounded-[3rem] p-4 overflow-hidden">
              <CardHeader className="p-8 border-b border-amber-500/10">
                <CardTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-primary">
                  {isEditing ? <Edit2 className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                  {isEditing ? 'Modify Item' : 'New Dish Entry'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Dish Designation</Label>
                  <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="bg-white border-amber-500/10 rounded-2xl h-14 font-bold" placeholder="Item Name" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Flavor Profile</Label>
                  <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} className="bg-white border-amber-500/10 rounded-2xl min-h-[120px] font-bold" placeholder="Taste description..." />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Price ($)</Label>
                    <Input type="number" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} className="bg-white border-amber-500/10 rounded-2xl h-14 font-bold" placeholder="0.00" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Section</Label>
                    <select 
                      className="w-full h-14 px-4 bg-white border border-amber-500/10 rounded-2xl outline-none font-bold text-sm"
                      value={formData.category}
                      onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    >
                      <option value="">Select...</option>
                      {['burgers', 'crispy-tenders', 'sides', 'drinks'].map(s => <option key={s} value={s}>{s}</option>)}
                      {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Visual Assets</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {formData.imageUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-inner group">
                        <Image src={url} alt="preview" fill className="object-cover" />
                        <button 
                          onClick={() => setFormData(f => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }))}
                          className="absolute inset-0 bg-primary/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square flex flex-col items-center justify-center bg-white rounded-xl cursor-pointer hover:bg-amber-50 transition-all border-2 border-dashed border-amber-500/20 group">
                      {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Upload className="h-6 w-6 text-foreground/20 group-hover:text-primary" />}
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleSaveProduct} className="flex-grow h-16 bg-primary hover:bg-primary/90 rounded-2xl font-black uppercase italic shadow-lg">
                    {isEditing ? 'Save Changes' : 'Initialize Dish'}
                  </Button>
                  {isEditing && (
                    <Button variant="ghost" onClick={resetForm} className="h-16 rounded-2xl border border-amber-500/10 px-6">
                      <Trash2 className="h-6 w-6 text-foreground/20" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 space-y-10">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-foreground">
                <LayoutGrid className="h-8 w-8 text-primary" /> Active Inventory
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {products.map(product => (
                  <div key={product.id} className="glass-card p-5 rounded-[2.5rem] flex gap-6 items-center group">
                    <div className="relative h-28 w-28 rounded-[2rem] overflow-hidden flex-shrink-0 shadow-lg">
                      <Image src={product.imageUrls[0] || 'https://picsum.photos/seed/food/200/200'} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-black text-lg leading-tight mb-1 uppercase italic tracking-tighter text-foreground">{product.name}</h4>
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest">{product.category}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="font-black text-xl text-foreground italic tracking-tighter">${product.price.toFixed(2)}</span>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-amber-500/5 hover:bg-amber-500/10" onClick={() => startEdit(product)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-primary bg-primary/5 hover:bg-primary/10" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="h-4 w-4" />
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
            <Card className="glass-card rounded-[3rem] p-4">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Kitchen Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex gap-4">
                  <Input 
                    placeholder="New Category Name" 
                    value={newCategory.name} 
                    onChange={e => setNewCategory(c => ({ ...c, name: e.target.value }))}
                    className="h-14 bg-white border-amber-500/10 rounded-2xl font-bold"
                  />
                  <Button onClick={handleAddCategory} className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg p-0">
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
                <div className="grid gap-3">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-5 bg-white border border-amber-500/10 rounded-2xl group hover:border-primary/30 transition-all">
                      <span className="font-black uppercase tracking-widest text-xs text-foreground/60">{cat.name}</span>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-primary hover:bg-primary/5" onClick={() => {
                        if(confirm('Remove category?')) deleteDoc(doc(db, 'categories', cat.id));
                      }}>
                        <Trash2 className="h-4 w-4" />
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