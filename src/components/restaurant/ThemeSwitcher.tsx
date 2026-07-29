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
  { id: 'black-gold', name: 'Midnight Gold', colors: 'bg-[#0A0A0C] border-[#D4AF37]' },
  { id: 'red-black', name: 'Crimson Royalty', colors: 'bg-[#991B1B] border-[#000000]' },
  { id: 'white-gold', name: 'Pure Luxe White', colors: 'bg-[#F8FAFC] border-[#CA8A04]' },
  { id: 'black-orange', name: 'Neon Ember', colors: 'bg-[#121214] border-[#EA580C]' },
  { id: 'green-orange', name: 'Emerald Gourmet', colors: 'bg-[#064E3B] border-[#F97316]' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-foreground/5 hover:bg-primary/20 backdrop-blur-md border border-foreground/10 transition-all group"
        >
          <Palette className="h-5 w-5 text-foreground group-hover:scale-110 transition-transform" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-card rounded-2xl p-2 border-primary/20 bg-background/90">
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
