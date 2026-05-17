"use client";

import { useState, useMemo, useRef } from 'react';
import { useFirestore, useStorage } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit, Save, X, Image as ImageIcon, Package, Layers, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Product, Category } from '@/types/shop';
import Image from 'next/image';

export default function AdminPage() {
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Data Fetching
  const productsRef = useMemo(() => db ? collection(db, 'products') : null, [db]);
  const categoriesRef = useMemo(() => db ? collection(db, 'categories') : null, [db]);
  
  const { data: products = [] } = useCollection<Product>(productsRef);
  const { data: categories = [] } = useCollection<Category>(categoriesRef);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSection, setNewSection] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Product Form State
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pCategory, setPCategory] = useState('');
  const [pStatus, setPStatus] = useState<'In Stock' | 'Low Stock' | 'Out of Stock'>('In Stock');
  const [pStock, setPStock] = useState('0');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const resetForm = () => {
    setEditingId(null);
    setPName('');
    setPDesc('');
    setPPrice('');
    setPCategory('');
    setPStatus('In Stock');
    setPStock('0');
    setExistingImages([]);
    setNewFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setPName(p.name);
    setPDesc(p.description);
    setPPrice(p.price.toString());
    setPCategory(p.category);
    setPStatus(p.status);
    setPStock(p.stock.toString());
    setExistingImages(p.images || []);
    setNewFiles([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...files]);
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(img => img !== url));
  };

  const handleSaveProduct = async () => {
    if (!db || !storage) return;
    if (!pName || !pPrice || !pCategory) {
      toast({ title: "خطأ في التحقق", description: "الاسم والسعر والقسم مطلوبة.", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload new files
      const uploadedUrls = [];
      for (const file of newFiles) {
        const storagePath = `products/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(url);
      }

      // 2. Combine with existing
      const allImages = [...existingImages, ...uploadedUrls];

      if (allImages.length === 0) {
        toast({ title: "تنبيه", description: "يجب إضافة صورة واحدة على الأقل.", variant: "destructive" });
        setIsUploading(false);
        return;
      }

      const productData = {
        name: pName,
        description: pDesc,
        price: parseFloat(pPrice),
        category: pCategory,
        status: pStatus,
        images: allImages,
        stock: parseInt(pStock),
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
        toast({ title: "تم التحديث", description: "تم حفظ تعديلات المنتج بنجاح." });
      } else {
        await addDoc(collection(db, 'products'), { ...productData, createdAt: serverTimestamp() });
        toast({ title: "تمت الإضافة", description: "تم إطلاق المنتج الجديد بنجاح." });
      }
      resetForm();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!db || !confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "تم الحذف", description: "تمت إزالة المنتج من المخزن." });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
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
      toast({ title: "تمت إضافة قسم", description: `القسم الجديد ${newSection} متاح الآن.` });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!db || !confirm('حذف هذا القسم؟')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast({ title: "تم حذف القسم" });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] p-6 lg:p-12 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="flex flex-col items-start gap-2">
          <h1 className="text-4xl font-headline font-bold">مدير <span className="text-gradient">Velozi</span></h1>
          <p className="text-muted-foreground">أضف منتجات جديدة، أدر المخزون، وخصص الأقسام بسهولة.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="glass border-white/10 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-fuchsia-500" />
                  {editingId ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>اسم المنتج</Label>
                    <Input value={pName} onChange={e => setPName(e.target.value)} className="bg-white/5 border-white/10 text-right" placeholder="مثال: سماعة Aero-X" />
                  </div>
                  <div className="space-y-2">
                    <Label>السعر ($)</Label>
                    <Input type="number" value={pPrice} onChange={e => setPPrice(e.target.value)} className="bg-white/5 border-white/10 text-right" placeholder="299.99" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>القسم / التصنيف</Label>
                    <Select value={pCategory} onValueChange={setPCategory}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-right">
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10">
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name} className="text-right">{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الحالة</Label>
                    <Select value={pStatus} onValueChange={(v: any) => setPStatus(v)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10">
                        <SelectItem value="In Stock" className="text-right">متوفر</SelectItem>
                        <SelectItem value="Low Stock" className="text-right">كمية محدودة</SelectItem>
                        <SelectItem value="Out of Stock" className="text-right">نفدت الكمية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>الوصف</Label>
                  <Textarea value={pDesc} onChange={e => setPDesc(e.target.value)} className="bg-white/5 border-white/10 min-h-[100px] text-right" placeholder="وصف المنتج..." />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4">
                  <Label className="flex items-center justify-between">
                    صور المنتج (ارفع من هاتفك)
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()} 
                      className="text-xs h-7 text-fuchsia-400"
                    >
                      <Upload className="h-3 w-3 ml-1" /> اختر صوراً
                    </Button>
                  </Label>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Existing Images */}
                    {existingImages.map((url, idx) => (
                      <div key={`existing-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5">
                        <Image src={url} alt="" fill className="object-cover" />
                        <button 
                          onClick={() => removeExistingImage(url)}
                          className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}

                    {/* New Selected Files */}
                    {newFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border border-fuchsia-500/30 bg-white/5">
                        <Image src={URL.createObjectURL(file)} alt="" fill className="object-cover opacity-70" />
                        <button 
                          onClick={() => removeNewFile(idx)}
                          className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Badge variant="secondary" className="bg-fuchsia-500 text-[8px]">جديد</Badge>
                        </div>
                      </div>
                    ))}

                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 hover:border-fuchsia-500/50 hover:bg-white/5 transition-all"
                    >
                      <Plus className="h-6 w-6 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">أضف المزيد</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={handleSaveProduct} 
                    className="flex-grow bg-fuchsia-600 hover:bg-fuchsia-700 glow-fuchsia font-bold h-12"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الرفع...</>
                    ) : (
                      editingId ? <><Save className="ml-2 h-4 w-4" /> تحديث المنتج</> : <><Plus className="ml-2 h-4 w-4" /> إطلاق المنتج</>
                    )}
                  </Button>
                  {editingId && (
                    <Button variant="outline" onClick={resetForm} className="border-white/10 hover:bg-white/5">
                      إلغاء
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Inventory Table */}
            <section className="glass rounded-2xl border-white/10 overflow-hidden shadow-xl">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-xl font-headline font-bold">المخزون الحالي</h3>
              </div>
              <Table>
                <TableHeader className="bg-white/[0.02]">
                  <TableRow className="border-white/5">
                    <TableHead className="text-right">المنتج</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-right">القسم</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">لا توجد منتجات حالياً.</TableCell></TableRow>
                  ) : (
                    products.map(p => (
                      <TableRow key={p.id} className="border-white/5 hover:bg-white/[0.01]">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center relative">
                              {p.images?.[0] ? <Image src={p.images[0]} alt="" fill className="object-cover" /> : <ImageIcon className="h-4 w-4 opacity-20" />}
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground uppercase">{p.status}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-bold">${p.price.toFixed(2)}</TableCell>
                        <TableCell><Badge variant="outline" className="border-fuchsia-500/20 text-fuchsia-400">{p.category}</Badge></TableCell>
                        <TableCell className="text-left">
                          <div className="flex justify-start gap-2">
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
                  إدارة الأقسام
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input value={newSection} onChange={e => setNewSection(e.target.value)} placeholder="اسم القسم الجديد" className="bg-white/5 border-white/10 text-right" />
                    <Button onClick={handleAddSection} size="icon" className="shrink-0 bg-violet-600 hover:bg-violet-700">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">الأقسام النشطة</Label>
                    <div className="space-y-1">
                      {categories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                          <span className="text-sm font-medium">{cat.name}</span>
                          <button onClick={() => handleDeleteSection(cat.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {categories.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-4">لا توجد أقسام معرفة.</p>}
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
