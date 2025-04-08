import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

async function savePartyflockHtml() {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });

    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    
    console.log('Navigating to Partyflock...');
    await page.goto('https://partyflock.nl/agenda/festivals', { 
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    
    // Handle cookie consent if present
    try {
      await page.waitForSelector('[id*="cookie"], [class*="cookie"], [id*="consent"], [class*="consent"]', { timeout: 5000 });
      await page.click('[id*="cookie"], [class*="cookie"], [id*="consent"], [class*="consent"]');
      console.log('Accepted cookies');
    } catch (e) {
      console.log('No cookie consent button found');
    }
    
    // Scroll to load all content
    console.log('Scrolling to load all content...');
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          
          if(totalHeight >= scrollHeight){
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    
    // Wait for any lazy-loaded content
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get the HTML content
    const html = await page.content();
    
    // Create directory if it doesn't exist
    const dir = path.join(process.cwd(), 'test-data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Save the HTML to a file
    const filePath = path.join(dir, 'partyflock-festivals.html');
    fs.writeFileSync(filePath, html);
    
    console.log(`HTML saved to ${filePath}`);
    
    await browser.close();
  } catch (error) {
    console.error('Error saving Partyflock HTML:', error);
  }
}

savePartyflockHtml(); 