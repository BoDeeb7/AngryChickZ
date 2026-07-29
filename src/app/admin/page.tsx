
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
import { Plus, Trash2, Edit2, Upload, Loader2, LayoutGrid, List } from 'lucide-react';
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
      toast({ title: "Images Uploaded", description: `${newUrls.length} photos ready.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!productsRef) return;
    if (!formData.name || !formData.price || !formData.category) {
      toast({ variant: "destructive", title: "Error", description: "Name, Price, and Category are required." });
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
        toast({ title: "Product Updated", description: "Changes synced successfully." });
      } else {
        await addDoc(productsRef, data);
        toast({ title: "Product Added", description: "Item is now live on the menu." });
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
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "Product Deleted" });
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

  const handleDeleteCategory = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast({ title: "Category Removed" });
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
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12">
      <div className="container mx-auto max-w-7xl">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Menu Management</h1>
            <p className="text-white/40 font-medium">Manage your restaurant items and categories.</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 hover:bg-white/5">
              View Website
            </Button>
          </Link>
        </header>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-xl h-14">
            <TabsTrigger value="products" className="px-8 rounded-lg h-full font-bold data-[state=active]:bg-red-600">
              <LayoutGrid className="h-4 w-4 mr-2" /> Products
            </TabsTrigger>
            <TabsTrigger value="categories" className="px-8 rounded-lg h-full font-bold data-[state=active]:bg-red-600">
              <List className="h-4 w-4 mr-2" /> Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="grid lg:grid-cols-12 gap-12 items-start">
            <Card className="lg:col-span-4 bg-white/5 border-white/10 rounded-3xl overflow-hidden glass-panel">
              <CardHeader className="p-8 border-b border-white/5">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  {isEditing ? <Edit2 className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                  {isEditing ? 'Edit Item' : 'New Item'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-white/40 uppercase tracking-widest">Item Name</Label>
                  <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="bg-black/20 border-white/5 rounded-xl" placeholder="e.g. Inferno Burger" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-white/40 uppercase tracking-widest">Description</Label>
                  <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} className="bg-black/20 border-white/5 rounded-xl min-h-[100px]" placeholder="Detailed description..." />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-white/40 uppercase tracking-widest">Price ($)</Label>
                    <Input type="number" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} className="bg-black/20 border-white/5 rounded-xl" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-white/40 uppercase tracking-widest">Category</Label>
                    <select 
                      className="w-full h-10 px-3 bg-black/20 border border-white/5 rounded-xl outline-none font-medium text-sm"
                      value={formData.category}
                      onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    >
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c.id} value={c.slug} className="bg-[#1a1b1f]">{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs font-bold text-white/40 uppercase tracking-widest">Photos</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.imageUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden glass-panel group">
                        <Image src={url} alt="preview" fill className="object-cover" />
                        <button 
                          onClick={() => setFormData(f => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }))}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square flex flex-col items-center justify-center bg-black/40 rounded-xl cursor-pointer hover:bg-black/60 transition-all border border-dashed border-white/10">
                      {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6 opacity-30" />}
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleSaveProduct} className="flex-grow h-14 bg-red-600 hover:bg-red-700 rounded-xl font-bold">
                    {isEditing ? 'Save Changes' : 'Add Item'}
                  </Button>
                  {isEditing && (
                    <Button variant="ghost" onClick={resetForm} className="h-14 rounded-xl border border-white/10">
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-8 space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Utensils className="h-6 w-6 text-red-600" /> Current Menu
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {products.map(product => (
                  <div key={product.id} className="glass-card p-4 rounded-2xl flex gap-4 group">
                    <div className="relative h-24 w-24 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={product.imageUrls[0] || 'https://picsum.photos/seed/food/200/200'} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-bold text-lg leading-tight mb-1">{product.name}</h4>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{product.category}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xl text-red-500">${product.price.toFixed(2)}</span>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-lg bg-white/5 hover:bg-white/10" onClick={() => startEdit(product)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-lg text-red-500 bg-red-500/5 hover:bg-red-500/10" onClick={() => handleDeleteProduct(product.id)}>
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
            <Card className="bg-white/5 border-white/10 rounded-3xl overflow-hidden glass-panel">
              <CardHeader className="p-8 border-b border-white/5">
                <CardTitle className="text-2xl font-bold">Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex gap-3">
                  <Input 
                    placeholder="Category Name" 
                    value={newCategory.name} 
                    onChange={e => setNewCategory(c => ({ ...c, name: e.target.value }))}
                    className="h-12 bg-black/20 border-white/5 rounded-xl"
                  />
                  <Button onClick={handleAddCategory} className="h-12 w-12 rounded-xl bg-red-600 hover:bg-red-700">
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>

                <div className="grid gap-3">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl">
                      <span className="font-bold">{cat.name}</span>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteCategory(cat.id)}>
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

import { Utensils } from 'lucide-react';
