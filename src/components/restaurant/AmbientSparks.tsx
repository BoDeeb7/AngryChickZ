'use client';

import { useEffect, useState, useMemo } from 'react';

export function AmbientSparks() {
  // Use useMemo to generate spark properties once to avoid hydration mismatch and heavy re-renders
  const [sparks, setSparks] = useState<{ id: number; left: string; duration: string; delay: string; size: string }[]>([]);

  useEffect(() => {
    // Generate sparks only on the client mount
    const generatedSparks = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${(i * 8.33) + (Math.random() * 5)}%`, // Distributed across screen
      duration: `${12 + Math.random() * 10}s`,
      delay: `${Math.random() * 5}s`,
      size: `${2 + Math.random() * 2}px`,
    }));
    setSparks(generatedSparks);
  }, []);

  if (sparks.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5] select-none">
      {sparks.map((spark) => (
        <div
          key={spark.id}
          className="absolute bottom-[-20px] animate-spark rounded-full bg-gradient-to-t from-amber-500 to-red-600 blur-[1px] will-change-transform"
          style={{
            left: spark.left,
            width: spark.size,
            height: spark.size,
            animationDuration: spark.duration,
            animationDelay: spark.delay,
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.6)',
            opacity: 0.4
          }}
        />
      ))}
    </div>
  );
}