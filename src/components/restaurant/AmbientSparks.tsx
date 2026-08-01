'use client';

import { useEffect, useState } from 'react';

export function AmbientSparks() {
  const [sparks, setSparks] = useState<{ id: number; left: string; duration: string; delay: string; size: string }[]>([]);

  useEffect(() => {
    // Highly optimized spark count for best performance
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const count = isMobile ? 4 : 8;

    const generatedSparks = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${(i * (100 / count)) + (Math.random() * 5)}%`,
      duration: `${15 + Math.random() * 10}s`,
      delay: `${Math.random() * 5}s`,
      size: `${1 + Math.random() * 2}px`,
    }));
    setSparks(generatedSparks);
  }, []);

  if (sparks.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5] select-none opacity-40">
      {sparks.map((spark) => (
        <div
          key={spark.id}
          className="absolute bottom-[-10px] animate-spark rounded-full bg-amber-500 blur-[1px]"
          style={{
            left: spark.left,
            width: spark.size,
            height: spark.size,
            animationDuration: spark.duration,
            animationDelay: spark.delay,
          }}
        />
      ))}
    </div>
  );
}