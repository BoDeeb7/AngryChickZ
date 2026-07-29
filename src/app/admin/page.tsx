
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
import { Plus, Trash2, Edit2, Upload, X, Loader2, Flame } from 'lucide-react';
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
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    
    try {
      const file = e.target.files[0];
      const storageRef = ref(storage, `menu-items/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, url] }));
      toast({ title: "Image Uploaded", description: "Successfully added to selection." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload image." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!productsRef) return;
    
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      createdAt: serverTimestamp(),
    };

    try {
      if (isEditing) {
        await updateDoc(doc(db, 'products', isEditing), data);
        toast({ title: "Product Updated", description: "Changes saved successfully." });
      } else {
        await addDoc(productsRef, data);
        toast({ title: "Product Added", description: "New item is now on the menu." });
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
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "Item Deleted", description: "Item removed from the menu." });
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
      toast({ title: "Category Added" });
    } catch (e) { console.error(e); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast({ title: "Category Deleted" });
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
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="bg-red-600 text-white py-12">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Angry Control Center</h1>
            <p className="font-bold opacity-80 uppercase text-xs tracking-widest mt-2">Powered By Hassan Deeb - Deeb Data</p>
          </div>
          <Button variant="outline" className="bg-white text-red-600 hover:bg-red-50 border-none rounded-xl" asChild>
            <a href="/">Back to Site</a>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-white border rounded-2xl h-14 p-1 shadow-lg">
            <TabsTrigger value="products" className="rounded-xl h-full font-bold px-8">Menu Items</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-xl h-full font-bold px-8">Sections</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="grid lg:grid-cols-3 gap-8 items-start">
            <Card className="rounded-[2rem] shadow-xl border-none">
              <CardHeader>
                <CardTitle className="uppercase italic font-black text-2xl">
                  {isEditing ? 'Edit Item' : 'New Dish'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Item Name</Label>
                  <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} className="rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input type="number" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select 
                      className="w-full h-10 px-3 bg-white border rounded-xl outline-none"
                      value={formData.category}
                      onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    >
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Badges</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Spicy', 'Best Seller', 'New', 'Limited'].map(badge => (
                      <button
                        key={badge}
                        onClick={() => setFormData(f => ({
                          ...f,
                          badges: f.badges.includes(badge) ? f.badges.filter(b => b !== badge) : [...f.badges, badge]
                        }))}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${formData.badges.includes(badge) ? 'bg-red-600 text-white' : 'bg-muted text-muted-foreground'}`}
                      >
                        {badge}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Photos</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.imageUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border">
                        <Image src={url} alt="preview" fill className="object-cover" />
                        <button 
                          onClick={() => setFormData(f => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }))}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted transition-colors">
                      {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveProduct} className="flex-grow h-12 rounded-xl bg-red-600 hover:bg-red-700 font-bold uppercase italic">
                    {isEditing ? 'Save Changes' : 'Launch Dish'}
                  </Button>
                  {isEditing && <Button variant="ghost" onClick={resetForm} className="h-12 rounded-xl">Cancel</Button>}
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-black uppercase italic">Current Menu Items</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-white p-4 rounded-3xl border flex gap-4 group">
                    <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                      <Image src={product.imageUrls[0] || 'https://picsum.photos/seed/food/100/100'} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-sm uppercase italic">{product.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-black text-red-600">${product.price.toFixed(2)}</span>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => startEdit(product)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-red-600" onClick={() => handleDeleteProduct(product.id)}>
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

          <TabsContent value="categories" className="max-w-xl">
            <Card className="rounded-[2rem] shadow-xl border-none">
              <CardHeader>
                <CardTitle className="uppercase italic font-black text-2xl">Menu Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <div className="flex-grow space-y-2">
                    <Input 
                      placeholder="Category Name (e.g., Burgers)" 
                      value={newCategory.name} 
                      onChange={e => setNewCategory(c => ({ ...c, name: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                  <Button onClick={handleAddCategory} className="h-10 rounded-xl bg-red-600 hover:bg-red-700">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-red-600/10 flex items-center justify-center">
                          <Flame className="h-4 w-4 text-red-600" />
                        </div>
                        <span className="font-bold">{cat.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteCategory(cat.id)}>
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
