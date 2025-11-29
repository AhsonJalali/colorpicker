'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, RotateCcw, Loader2, Globe, Sparkles } from 'lucide-react';

interface BrowserProps {
  onColorPick: (color: string) => void;
}

export function Browser({ onColorPick }: BrowserProps) {
  const [url, setUrl] = useState('https://example.com');
  const [isLoading, setIsLoading] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const [loupePos, setLoupePos] = useState({ x: 0, y: 0 });
  const [showLoupe, setShowLoupe] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const fetchUrl = async (targetUrl: string) => {
    if (!targetUrl) return;
    setIsLoading(true);
    setScreenshot(null);
    
    try {
      // Ensure protocol
      let finalUrl = targetUrl;
      if (!targetUrl.startsWith('http')) {
        finalUrl = `https://${targetUrl}`;
      }
      
      const res = await fetch(`/api/browser?url=${encodeURIComponent(finalUrl)}`);
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setScreenshot(data.screenshot);
      setUrl(data.url || finalUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUrl(url);
  };

  // Draw image to canvas when screenshot changes
  useEffect(() => {
    if (!screenshot || !canvasRef.current) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        imageRef.current = img;
      }
    };
    img.src = screenshot;

    // Cleanup function for memory management
    return () => {
      if (imageRef.current) {
        imageRef.current = null;
      }
    };
  }, [screenshot]);

  // Cleanup canvas on unmount
  useEffect(() => {
    return () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setLoupePos({ x: e.clientX, y: e.clientY });
    setShowLoupe(true);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      try {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const hex = `#${[pixel[0], pixel[1], pixel[2]].map(c => c.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
        setHoverColor(hex);
      } catch {
        // Can fail if out of bounds
      }
    }
  };

  const handleClick = () => {
    if (hoverColor) {
      onColorPick(hoverColor);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto space-y-4">
      {/* Browser Bar */}
      <Card className="p-3 flex items-center space-x-3 glass border-border/50 sticky top-4 z-10 shadow-lg shadow-primary/5 animate-scale-in">
        <div className="flex space-x-3 w-full">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => fetchUrl(url)} 
            disabled={isLoading}
            className="hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
          </Button>
          <form onSubmit={handleSubmit} className="flex-1 flex space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                value={url} 
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 bg-muted/30 border-border/50 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all"
                placeholder="Enter website URL..."
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-chart-4 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              Go
            </Button>
          </form>
        </div>
      </Card>

      {/* Viewport */}
      <div className="flex-1 relative min-h-[500px] rounded-2xl overflow-hidden border border-border/50 bg-card shadow-xl shadow-primary/5 flex items-center justify-center">
        {!screenshot && !isLoading && (
          <div className="text-center p-12 animate-fade-in-up">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-chart-5/20 flex items-center justify-center animate-float">
                <Globe className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-chart-5 to-chart-1 flex items-center justify-center animate-pulse">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-display font-semibold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Internal Browser
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Enter a URL above to capture a website and start picking beautiful colors
            </p>
            <div className="mt-6 flex justify-center gap-2">
              {['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'].map((color, i) => (
                <div
                  key={color}
                  className="w-4 h-4 rounded-full animate-float"
                  style={{ 
                    backgroundColor: color,
                    animationDelay: `${i * 100}ms`
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="flex flex-col items-center gap-6 animate-fade-in-up">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent blur-xl opacity-50 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Loading website...</p>
              <p className="text-xs text-muted-foreground mt-1">Capturing screenshot</p>
            </div>
          </div>
        )}

        {screenshot && (
          <>
            <canvas 
              ref={canvasRef}
              className="w-full h-auto cursor-crosshair object-contain max-h-[80vh] animate-scale-in"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setShowLoupe(false)}
              onClick={handleClick}
            />
            
            {/* Loupe / Magnifier */}
            {showLoupe && hoverColor && (
              <div 
                className="fixed pointer-events-none z-50 transition-all duration-75 ease-out"
                style={{
                  left: loupePos.x,
                  top: loupePos.y,
                  transform: 'translate(-50%, -120%)',
                }}
              >
                <div className="relative">
                  <div 
                    className="w-24 h-24 rounded-2xl border-4 border-white shadow-2xl overflow-hidden"
                    style={{ backgroundColor: hoverColor }}
                  />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-mono font-medium px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                    {hoverColor}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
