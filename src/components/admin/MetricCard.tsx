
"use client";

import { DashboardMetric } from '@/types/shop';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function MetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <Card className="glass border-white/5 overflow-hidden group hover:border-fuchsia-500/30 transition-colors">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${metric.isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {metric.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {metric.change}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-bold group-hover:text-fuchsia-400 transition-colors">{metric.value}</h3>
          <div className="w-16 h-8 opacity-20 overflow-hidden">
             {/* Sparkline placeholder SVG */}
             <svg viewBox="0 0 100 40" className="w-full h-full stroke-fuchsia-500 stroke-2 fill-none">
                <path d="M0 35 L10 32 L20 38 L30 15 L40 25 L50 5 L60 20 L70 30 L80 10 L90 15 L100 5" />
             </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
