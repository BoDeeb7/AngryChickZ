'use client';

import { useEffect, useState } from 'react';

export function AmbientSparks() {
  const [sparks, setSparks] = useState<{ id: number; left: string; duration: string; delay: string; size: string }[]>([]);

  useEffect(() => {
    // Generate a fixed set of sparks on mount to avoid hydration mismatch
    const newSparks = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${10 + Math.random() * 15}s`,
      delay: `${Math.random() * 10}s`,
      size: `${2 + Math.random() * 3}px`,
    }));
    setSparks(newSparks);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
      {sparks.map((spark) => (
        <div
          key={spark.id}
          className="absolute bottom-0 animate-spark rounded-full bg-gradient-to-t from-amber-500 to-red-500 blur-[1px]"
          style={{
            left: spark.left,
            width: spark.size,
            height: spark.size,
            animationDuration: spark.duration,
            animationDelay: spark.delay,
            boxShadow: '0 0 10px rgba(245, 158, 11, 0.8)',
          }}
        />
      ))}
    </div>
  );
}