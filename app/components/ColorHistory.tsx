'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2, Copy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ColorHistoryProps {
  colors: string[];
  onClear: () => void;
  onSelect: (color: string) => void;
}

export function ColorHistory({ colors, onClear, onSelect }: ColorHistoryProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4">
        <CardTitle className="text-sm font-medium">History</CardTitle>
        {colors.length > 0 && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-muted-foreground hover:text-destructive" 
            onClick={onClear}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0">
        {colors.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">No colors yet</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="px-4 pb-4 space-y-1">
              {colors.map((color, index) => (
                <button
                  key={`${color}-${index}`}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors text-left group"
                  onClick={() => onSelect(color)}
                >
                  <div 
                    className="w-8 h-8 rounded border flex-shrink-0" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-mono flex-1 truncate">{color}</span>
                  <Copy className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
