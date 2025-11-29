import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

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
    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set a reasonable viewport for desktop viewing
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the URL
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    // Take screenshot
    const screenshot = await page.screenshot({ 
      encoding: 'base64',
      type: 'jpeg',
      quality: 80,
      fullPage: false // viewport only is usually better for a "browser" window feel
    });

    await browser.close();

    return NextResponse.json({ 
      screenshot: `data:image/jpeg;base64,${screenshot}`,
      url 
    });

  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

