
"use client";

import { useState } from 'react';
import { Calculator, ChevronRight, ChevronLeft, Percent, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function UtilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [discount, setDiscount] = useState<string>('15');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const amt = parseFloat(amount);
    const dsc = parseFloat(discount);
    if (!isNaN(amt) && !isNaN(dsc)) {
      setResult(amt - (amt * (dsc / 100)));
    }
  };

  return (
    <div className={`fixed right-0 top-1/2 -translate-y-1/2 z-30 transition-all duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-48px)]'}`}>
      <div className="flex items-start">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 w-12 bg-fuchsia-600 flex items-center justify-center rounded-l-2xl shadow-lg glow-fuchsia group"
        >
          {isOpen ? <ChevronRight className="h-5 w-5" /> : <Calculator className="h-5 w-5 group-hover:scale-110 transition-transform" />}
        </button>
        
        <div className="w-72 glass border border-white/10 rounded-l-2xl p-6 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-2 mb-6 text-fuchsia-400">
            <Percent className="h-4 w-4" />
            <h3 className="font-headline font-bold uppercase tracking-wider text-xs">Savings Simulator</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Original Price ($)</Label>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/5 border-white/10 rounded-xl"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Discount Rate (%)</Label>
              <Input 
                type="number" 
                value={discount} 
                onChange={(e) => setDiscount(e.target.value)}
                className="bg-white/5 border-white/10 rounded-xl"
                placeholder="15"
              />
            </div>
            
            <Button 
              onClick={calculate} 
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold"
            >
              Simulate Savings
            </Button>

            {result !== null && (
              <div className="mt-6 p-4 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-center animate-in zoom-in duration-300">
                <p className="text-[10px] text-fuchsia-400 uppercase tracking-widest font-bold mb-1">Final Velozi Price</p>
                <p className="text-2xl font-bold text-white">${result.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-2">You save ${(parseFloat(amount) - result).toFixed(2)}</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between opacity-50">
            <span className="text-[10px] uppercase font-bold tracking-tighter flex items-center gap-1">
              <Wallet className="h-3 w-3" /> Velozi Credits
            </span>
            <span className="text-[10px] font-bold">Available: $0.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
