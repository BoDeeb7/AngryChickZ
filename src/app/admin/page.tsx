
"use client";

import { useState } from 'react';
import { MOCK_METRICS, MOCK_PRODUCTS } from '@/lib/mock-data';
import { MetricCard } from '@/components/admin/MetricCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Package, LayoutDashboard, Settings, LogOut, Wand2, Loader2, Sparkles } from 'lucide-react';
import { adminHeadlineGenerator } from '@/ai/flows/admin-headline-generator';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Form states
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Tech');
  const [headline, setHeadline] = useState('');

  const handleGenerateHeadline = async () => {
    if (!name || !desc) {
      toast({
        title: "Missing Information",
        description: "Please enter a product name and description first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await adminHeadlineGenerator({
        productName: name,
        productDescription: desc,
        productCategory: category,
        targetAudience: "luxury shoppers"
      });
      setHeadline(result.headline);
      toast({
        title: "Headline Generated",
        description: "AI has crafted a cinematic headline for your product.",
      });
    } catch (err) {
      toast({
        title: "Generation Failed",
        description: "Could not connect to AI services.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-white/5 hidden lg:flex flex-col p-6 fixed h-full bg-black/20">
        <div className="mb-12">
          <span className="text-xl font-headline font-bold text-gradient">VELOZI ADMIN</span>
        </div>
        
        <nav className="flex-grow space-y-2">
          <Button variant="ghost" className="w-full justify-start text-fuchsia-400 bg-fuchsia-500/5 hover:bg-fuchsia-500/10">
            <LayoutDashboard className="mr-3 h-4 w-4" /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5">
            <Package className="mr-3 h-4 w-4" /> Inventory
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5">
            <Settings className="mr-3 h-4 w-4" /> Settings
          </Button>
        </nav>

        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-red-400 mt-auto">
          <LogOut className="mr-3 h-4 w-4" /> Sign Out
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow lg:ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-headline font-bold">Seller <span className="text-gradient">Insights</span></h1>
            <p className="text-muted-foreground">Manage your boutique and track performance metrics.</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="bg-fuchsia-600 hover:bg-fuchsia-700 glow-fuchsia rounded-full">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </header>

        {/* Metrics Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {MOCK_METRICS.map((metric, i) => (
            <MetricCard key={i} metric={metric} />
          ))}
        </section>

        {/* Inventory Section */}
        <section className="glass rounded-2xl border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-lg font-headline font-bold">Recent Inventory</h3>
            <div className="flex gap-2">
              <Input className="w-64 bg-white/5 border-white/10 h-9" placeholder="Filter inventory..." />
            </div>
          </div>
          
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5">
                <TableHead className="w-[300px]">Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PRODUCTS.map((product) => (
                <TableRow key={product.id} className="border-white/5 hover:bg-white/[0.01] transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10 relative">
                        <img src={product.imageUrl} alt="" className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{product.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'In Stock' ? 'default' : 'secondary'} className={`${product.status === 'In Stock' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'} border-none`}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono font-bold">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        {/* Add Product Modal Overlay */}
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className="glass w-full max-w-2xl rounded-3xl border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-headline font-bold">New <span className="text-gradient">Collection Entry</span></h2>
                <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-full h-10 w-10 p-0 hover:bg-white/5">
                   <Package className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white/5 border-white/10" placeholder="e.g. Aero-X Pro" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10">
                        <SelectItem value="Tech">Tech</SelectItem>
                        <SelectItem value="Fashion">Fashion</SelectItem>
                        <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="bg-white/5 border-white/10 min-h-[120px]" placeholder="Key features and details..." />
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="p-6 rounded-2xl bg-fuchsia-500/5 border border-fuchsia-500/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2">
                        <Sparkles className="h-4 w-4 text-fuchsia-500 opacity-50" />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-fuchsia-400 mb-4 flex items-center gap-2">
                        <Wand2 className="h-3 w-3" /> Marketing AI
                      </h4>
                      <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                        Use our GenAI tool to craft a high-converting headline for your landing pages and promotions.
                      </p>
                      
                      <div className="space-y-4">
                        <Button 
                          onClick={handleGenerateHeadline} 
                          disabled={isGenerating}
                          className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 glow-fuchsia rounded-xl text-xs font-bold"
                        >
                          {isGenerating ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Wand2 className="mr-2 h-3 w-3" />}
                          Generate Headline
                        </Button>

                        {headline && (
                          <div className="p-4 rounded-xl bg-black/40 border border-white/5 animate-in slide-in-from-top-2">
                            <Label className="text-[10px] text-fuchsia-500 uppercase font-bold">Suggested Headline</Label>
                            <p className="text-sm font-headline italic mt-1">&quot;{headline}&quot;</p>
                          </div>
                        )}
                      </div>
                   </div>

                   <div className="pt-4 space-y-3">
                      <Button className="w-full rounded-xl bg-white text-black hover:bg-fuchsia-500 hover:text-white font-bold h-12">
                        Launch Product
                      </Button>
                      <Button variant="ghost" onClick={() => setIsAdding(false)} className="w-full rounded-xl hover:bg-white/5 h-12">
                        Cancel
                      </Button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
