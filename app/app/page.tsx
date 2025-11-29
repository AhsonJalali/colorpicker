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
    <main className="relative flex h-screen w-full overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-radial bg-grid-pattern" />
      
      <div className="relative flex w-full p-6 gap-6">
        {/* Main Browser Area */}
        <div className="flex-1 flex flex-col min-w-0 animate-fade-in-up">
          <header className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse-ring">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold tracking-tight bg-gradient-to-r from-primary via-chart-4 to-accent bg-clip-text text-transparent">
                  Color Picker
                </h1>
                <p className="text-muted-foreground text-sm">
                  Navigate, explore, and extract beautiful colors
                </p>
              </div>
            </div>
          </header>
          <div className="flex-1 min-h-0 animate-fade-in-up animation-delay-200">
            <Browser onColorPick={handleColorPick} />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0 flex flex-col animate-slide-in-right animation-delay-300">
          <ColorHistory 
            colors={colors} 
            onClear={handleClearHistory} 
            onSelect={handleHistorySelect}
          />
        </aside>
      </div>
    </main>
  );
}
