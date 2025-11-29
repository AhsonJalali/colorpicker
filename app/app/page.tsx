'use client';

import { useState, useCallback } from 'react';
import { Browser } from '@/components/Browser';
import { ColorHistory } from '@/components/ColorHistory';
import { toast } from 'sonner';

export default function Home() {
  const [colors, setColors] = useState<string[]>([]);

  const handleColorPick = useCallback((color: string) => {
    setColors(prev => {
      // Avoid duplicates at the top
      const newColors = prev.filter(c => c !== color);
      return [color, ...newColors];
    });
    
    // Copy to clipboard
    navigator.clipboard.writeText(color);
    toast.success('Color copied!', {
      description: `${color} copied to clipboard`,
      duration: 2000,
    });
  }, []);

  const handleClearHistory = useCallback(() => {
    setColors([]);
    toast.info('History cleared');
  }, []);

  const handleHistorySelect = useCallback((color: string) => {
    navigator.clipboard.writeText(color);
    toast.success('Color copied!', {
      description: `${color} copied to clipboard`,
    });
  }, []);

  return (
    <main className="flex h-screen w-full overflow-hidden p-4 gap-4">
      {/* Main Browser Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Color Picker</h1>
            <p className="text-muted-foreground">Navigate, explore, and extract colors.</p>
        </header>
        <div className="flex-1 min-h-0">
            <Browser onColorPick={handleColorPick} />
        </div>
      </div>

      {/* Sidebar - Fixed width */}
      <aside className="w-80 flex-shrink-0 flex flex-col pt-[88px]"> 
      {/* pt-[88px] aligns sidebar with browser content area approx */}
        <ColorHistory 
          colors={colors} 
          onClear={handleClearHistory} 
          onSelect={handleHistorySelect}
        />
      </aside>
    </main>
  );
}
