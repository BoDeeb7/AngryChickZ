'use client';

import { useEffect, useState } from 'react';

export function AmbientSparks() {
  const [mounted, setMounted] = useState(false);
  const [sparks, setSparks] = useState<{ id: number; left: string; duration: string; delay: string; size: string }[]>([]);

  useEffect(() => {
    setMounted(true);
    const count = 5; // Reduced for performance
    const generatedSparks = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${(i * (100 / count)) + (Math.random() * 10)}%`,
      duration: `${15 + Math.random() * 10}s`,
      delay: `${Math.random() * 5}s`,
      size: `${1 + Math.random() * 1}px`,
    }));
    setSparks(generatedSparks);
  }, []);

  if (!mounted || sparks.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5] select-none opacity-30">
      {sparks.map((spark) => (
        <div
          key={spark.id}
          className="absolute bottom-[-10px] animate-spark rounded-full bg-amber-500 blur-[1px] animate-gpu"
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