'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, Palette, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ColorHistoryProps {
  colors: string[];
  onClear: () => void;
  onSelect: (color: string) => void;
}

export function ColorHistory({ colors, onClear, onSelect }: ColorHistoryProps) {
  if (colors.length === 0) {
    return (
      <Card className="h-full glass border-border/50 shadow-xl shadow-primary/5 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-sm font-display font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Palette className="w-4 h-4 text-primary" />
            </div>
            Color History
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center py-16">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center animate-float">
              <Sparkles className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm text-center font-medium">
            No colors picked yet
          </p>
          <p className="text-muted-foreground/70 text-xs text-center mt-1 max-w-[200px]">
            Click on any pixel in the browser to capture its color
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full glass border-border/50 shadow-xl shadow-primary/5 rounded-2xl overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/50 pb-4">
        <CardTitle className="text-sm font-display font-semibold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Palette className="w-4 h-4 text-primary" />
          </div>
          <span>History</span>
          <span className="ml-1 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {colors.length}
          </span>
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" 
          onClick={onClear}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {colors.map((color, index) => (
            <div 
              key={`${color}-${index}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200 group cursor-pointer animate-fade-in-up border border-transparent hover:border-border/50"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onSelect(color)}
            >
              <div 
                className="w-10 h-10 rounded-xl shadow-lg shrink-0 color-swatch ring-2 ring-white/50" 
                style={{ 
                  backgroundColor: color,
                  boxShadow: `0 4px 14px ${color}40`
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono font-semibold truncate">{color}</p>
                <p className="text-xs text-muted-foreground">Click to copy</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/10 hover:text-primary"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Gradient fade at bottom */}
      <div className="h-8 bg-gradient-to-t from-card to-transparent pointer-events-none -mt-8 relative z-10" />
    </Card>
  );
}
