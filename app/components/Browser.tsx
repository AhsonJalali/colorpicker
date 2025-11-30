'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Loader2 } from 'lucide-react';

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

    return () => {
      imageRef.current = null;
    };
  }, [screenshot]);

  useEffect(() => {
    return () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
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
        // Ignore errors
      }
    }
  };

  const handleClick = () => {
    if (hoverColor) {
      onColorPick(hoverColor);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* URL Bar */}
      <Card className="p-2 flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => fetchUrl(url)} 
          disabled={isLoading}
          className="h-8 w-8"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
        </Button>
        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <Input 
            value={url} 
            onChange={(e) => setUrl(e.target.value)}
            className="h-8 text-sm"
            placeholder="Enter URL..."
          />
          <Button type="submit" disabled={isLoading} size="sm">
            Go
          </Button>
        </form>
      </Card>

      {/* Viewport */}
      <Card className="flex-1 min-h-0 overflow-hidden flex items-center justify-center">
        {!screenshot && !isLoading && (
          <div className="text-center text-muted-foreground p-8">
            <p className="text-sm">Enter a URL to start picking colors</p>
          </div>
        )}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        )}

        {screenshot && (
          <>
            <canvas 
              ref={canvasRef}
              className="max-w-full max-h-full cursor-crosshair object-contain"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setShowLoupe(false)}
              onClick={handleClick}
            />
            
            {showLoupe && hoverColor && (
              <div 
                className="fixed pointer-events-none z-50"
                style={{
                  left: loupePos.x,
                  top: loupePos.y,
                  transform: 'translate(-50%, -120%)',
                }}
              >
                <div className="flex items-center gap-2 bg-popover border rounded-md px-2 py-1.5 shadow-lg">
                  <div 
                    className="w-5 h-5 rounded border"
                    style={{ backgroundColor: hoverColor }}
                  />
                  <span className="text-xs font-mono">{hoverColor}</span>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
