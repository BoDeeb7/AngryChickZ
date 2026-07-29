'use client';

import { Palette, Check } from 'lucide-react';
import { useTheme, ThemeType } from '@/context/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const themes: { id: ThemeType; name: string; colors: string }[] = [
  { id: 'default', name: 'Cream & Crimson', colors: 'bg-[#FFFBEB] border-[#E11D48]' },
  { id: 'black-gold', name: 'Luxury Noir', colors: 'bg-[#0F0F12] border-[#D4AF37]' },
  { id: 'red-black', name: 'Crimson Heat', colors: 'bg-[#111827] border-[#E11D48]' },
  { id: 'white-gold', name: 'Minimalist Royalty', colors: 'bg-[#FAFAFA] border-[#EAB308]' },
  { id: 'black-orange', name: 'Neon Ember', colors: 'bg-[#09090B] border-[#F97316]' },
  { id: 'green-orange', name: 'Citrus Burst', colors: 'bg-[#065F46] border-[#FB923C]' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-14 w-14 rounded-full bg-white/10 hover:bg-primary/20 backdrop-blur-md border border-white/10 transition-all group"
        >
          <Palette className="h-5 w-5 text-foreground group-hover:scale-110 transition-transform" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-card rounded-2xl p-2 border-primary/20">
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-2 py-2">
          Select Palette
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-primary/10" />
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="flex items-center justify-between rounded-xl px-2 py-2 cursor-pointer hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`h-4 w-4 rounded-full border-2 ${t.colors}`} />
              <span className={`text-xs font-bold ${theme === t.id ? 'text-primary' : 'text-foreground/70'}`}>
                {t.name}
              </span>
            </div>
            {theme === t.id && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
