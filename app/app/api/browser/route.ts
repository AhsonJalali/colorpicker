import { NextResponse } from 'next/server';
import puppeteer, { Browser } from 'puppeteer';

// Simple browser pool and cache for performance optimization
let browserInstance: Browser | null = null;
let browserLastUsed: number = 0;
const BROWSER_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Screenshot cache with TTL
interface CacheEntry {
  screenshot: string;
  timestamp: number;
  url: string;
}
const screenshotCache = new Map<string, CacheEntry>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_SIZE = 50;

// Get or create browser instance (browser pooling)
async function getBrowser(): Promise<Browser> {
  const now = Date.now();
  
  // Close stale browser
  if (browserInstance && (now - browserLastUsed > BROWSER_TIMEOUT)) {
    try {
      await browserInstance.close();
    } catch {
      // Ignore close errors
    }
    browserInstance = null;
  }
  
  // Create new browser if needed
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1280,800'
      ]
    });
  }
  
  browserLastUsed = now;
  return browserInstance;
}

// Clean expired cache entries
function cleanCache() {
  const now = Date.now();
  for (const [key, entry] of screenshotCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      screenshotCache.delete(key);
    }
  }
  
  // If still too large, remove oldest entries
  if (screenshotCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(screenshotCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => screenshotCache.delete(key));
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL is required' },
      { status: 400 }
    );
  }

  try {
    // Check cache first
    const cacheKey = url.toLowerCase();
    const cached = screenshotCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return NextResponse.json({ 
        screenshot: cached.screenshot,
        url: cached.url,
        cached: true
      });
    }

    // Get browser from pool
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    try {
      // Set a reasonable viewport for desktop viewing
      await page.setViewport({ width: 1280, height: 800 });
      
      // Set user agent to avoid bot detection
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      
      // Navigate to the URL with timeout
      await page.goto(url, { 
        waitUntil: 'networkidle2', // Faster than networkidle0
        timeout: 20000 
      });

      // Take screenshot with optimized settings
      const screenshot = await page.screenshot({ 
        encoding: 'base64',
        type: 'webp', // WebP is smaller than JPEG
        quality: 75,
        fullPage: false
      });

      const screenshotData = `data:image/webp;base64,${screenshot}`;
      
      // Cache the result
      cleanCache();
      screenshotCache.set(cacheKey, {
        screenshot: screenshotData,
        timestamp: Date.now(),
        url
      });

      return NextResponse.json({ 
        screenshot: screenshotData,
        url,
        cached: false
      });
      
    } finally {
      // Always close the page (but not the browser)
      await page.close();
    }

  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { error: 'Failed to load website. It might be blocked or unavailable.' },
      { status: 500 }
    );
  }
}

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    if (browserInstance) {
      await browserInstance.close();
    }
  });
}
