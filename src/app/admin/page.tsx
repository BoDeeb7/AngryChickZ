
"use client";

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit, Save, X, Image as ImageIcon, Package, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Product, Category } from '@/types/shop';

export default function AdminPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  // Data Fetching
  const productsRef = useMemo(() => db ? collection(db, 'products') : null, [db]);
  const categoriesRef = useMemo(() => db ? collection(db, 'categories') : null, [db]);
  
  const { data: products = [] } = useCollection<Product>(productsRef);
  const { data: categories = [] } = useCollection<Category>(categoriesRef);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSection, setNewSection] = useState('');
  
  // Product Form State
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pCategory, setPCategory] = useState('');
  const [pStatus, setPStatus] = useState<'In Stock' | 'Low Stock' | 'Out of Stock'>('In Stock');
  const [pImages, setPImages] = useState<string[]>(['']);
  const [pStock, setPStock] = useState('0');

  const resetForm = () => {
    setEditingId(null);
    setPName('');
    setPDesc('');
    setPPrice('');
    setPCategory('');
    setPStatus('In Stock');
    setPImages(['']);
    setPStock('0');
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setPName(p.name);
    setPDesc(p.description);
    setPPrice(p.price.toString());
    setPCategory(p.category);
    setPStatus(p.status);
    setPImages(p.images.length > 0 ? p.images : ['']);
    setPStock(p.stock.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProduct = async () => {
    if (!db) return;
    if (!pName || !pPrice || !pCategory) {
      toast({ title: "Validation Error", description: "Name, Price, and Category are required.", variant: "destructive" });
      return;
    }

    const productData = {
      name: pName,
      description: pDesc,
      price: parseFloat(pPrice),
      category: pCategory,
      status: pStatus,
      images: pImages.filter(img => img.trim() !== ''),
      stock: parseInt(pStock),
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
        toast({ title: "Product Updated", description: "The product details have been saved." });
      } else {
        await addDoc(collection(db, 'products'), { ...productData, createdAt: serverTimestamp() });
        toast({ title: "Product Added", description: "New item has been added to the vault." });
      }
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!db || !confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "Product Deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleAddSection = async () => {
    if (!db || !newSection) return;
    try {
      await addDoc(collection(db, 'categories'), { 
        name: newSection, 
        slug: newSection.toLowerCase().replace(/\s+/g, '-') 
      });
      setNewSection('');
      toast({ title: "Section Added", description: `${newSection} is now a live section.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!db || !confirm('Delete this section?')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast({ title: "Section Removed" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const addImageField = () => setPImages([...pImages, '']);
  const updateImageField = (idx: number, val: string) => {
    const newImgs = [...pImages];
    newImgs[idx] = val;
    setPImages(newImgs);
  };
  const removeImageField = (idx: number) => {
    if (pImages.length > 1) setPImages(pImages.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen bg-[#09090b] p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <header>
          <h1 className="text-4xl font-headline font-bold">Velozi <span className="text-gradient">Manager</span></h1>
          <p className="text-muted-foreground mt-2">Upload new items, manage inventory, and customize sections.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="glass border-white/10 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-fuchsia-500" />
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input value={pName} onChange={e => setPName(e.target.value)} className="bg-white/5 border-white/10" placeholder="e.g. Aero-X Pro" />
                  </div>
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input type="number" value={pPrice} onChange={e => setPPrice(e.target.value)} className="bg-white/5 border-white/10" placeholder="299.99" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Section / Category</Label>
                    <Select value={pCategory} onValueChange={setPCategory}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10">
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={pStatus} onValueChange={(v: any) => setPStatus(v)}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10">
                        <SelectItem value="In Stock">In Stock</SelectItem>
                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={pDesc} onChange={e => setPDesc(e.target.value)} className="bg-white/5 border-white/10 min-h-[100px]" placeholder="Cinematic product description..." />
                </div>

                <div className="space-y-4">
                  <Label className="flex items-center justify-between">
                    Product Images (URLs)
                    <Button variant="ghost" size="sm" onClick={addImageField} className="text-xs h-7 text-fuchsia-400">
                      <Plus className="h-3 w-3 mr-1" /> Add Image URL
                    </Button>
                  </Label>
                  <div className="space-y-2">
                    {pImages.map((url, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-grow relative">
                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input value={url} onChange={e => updateImageField(idx, e.target.value)} className="bg-white/5 border-white/10 pl-10" placeholder="https://..." />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeImageField(idx)} className="text-muted-foreground hover:text-red-500">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleSaveProduct} className="flex-grow bg-fuchsia-600 hover:bg-fuchsia-700 glow-fuchsia font-bold h-12">
                    {editingId ? <><Save className="mr-2 h-4 w-4" /> Update Item</> : <><Plus className="mr-2 h-4 w-4" /> Launch Product</>}
                  </Button>
                  {editingId && (
                    <Button variant="outline" onClick={resetForm} className="border-white/10 hover:bg-white/5">
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Inventory Table */}
            <section className="glass rounded-2xl border-white/10 overflow-hidden shadow-xl">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-xl font-headline font-bold">Existing Inventory</h3>
              </div>
              <Table>
                <TableHeader className="bg-white/[0.02]">
                  <TableRow className="border-white/5">
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No products in vault.</TableCell></TableRow>
                  ) : (
                    products.map(p => (
                      <TableRow key={p.id} className="border-white/5 hover:bg-white/[0.01]">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                              {p.images?.[0] ? <img src={p.images[0]} alt="" className="object-cover" /> : <ImageIcon className="h-4 w-4 opacity-20" />}
                            </div>
                            <div>
                              <p className="font-bold">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground uppercase">{p.status}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-bold">${p.price.toFixed(2)}</TableCell>
                        <TableCell><Badge variant="outline" className="border-fuchsia-500/20 text-fuchsia-400">{p.category}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/5">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(p.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/5">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </section>
          </div>

          {/* Sidebar / Sections */}
          <div className="space-y-8">
            <Card className="glass border-white/10 shadow-xl overflow-hidden sticky top-24">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-violet-500" />
                  Manage Sections
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input value={newSection} onChange={e => setNewSection(e.target.value)} placeholder="New Section Name" className="bg-white/5 border-white/10" />
                    <Button onClick={handleAddSection} size="icon" className="shrink-0 bg-violet-600 hover:bg-violet-700">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Active Sections</Label>
                    <div className="space-y-1">
                      {categories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                          <span className="text-sm font-medium">{cat.name}</span>
                          <button onClick={() => handleDeleteSection(cat.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {categories.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-4">No sections defined.</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
