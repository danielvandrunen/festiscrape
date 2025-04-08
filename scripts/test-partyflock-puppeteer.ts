import puppeteer from 'puppeteer';
import * as fs from 'fs';

async function testPartyflockPuppeteer() {
  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = 'https://partyflock.nl/agenda/festivals';

  try {
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' }); // Wait for network activity to cease

    console.log('Page loaded. Extracting HTML content...');
    const content = await page.content();

    // Save the HTML to a file for inspection
    const filePath = './test-data/partyflock-debug.html';
    fs.writeFileSync(filePath, content);
    console.log(`HTML content saved to ${filePath}`);

    console.log('\nAttempting to find festival items with Puppeteer evaluation...');
    // Example: Try to count elements matching a potential selector
    const potentialSelector = '.table-responsive tbody tr'; // Example selector based on common table structures
    const itemCount = await page.$$eval(potentialSelector, items => items.length);
    console.log(`Found ${itemCount} items matching selector: ${potentialSelector}`);

  } catch (error) {
    console.error('Error during Puppeteer execution:', error);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

testPartyflockPuppeteer(); 