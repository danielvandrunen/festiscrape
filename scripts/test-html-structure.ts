import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
  try {
    const response = await axios.get('https://festileaks.com/festivalagenda/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });

    const $ = cheerio.load(response.data);

    // Look for festival items in different possible containers
    const selectors = [
      '.festival-item',
      '.agenda-item',
      '.event-item',
      '[class*="festival"]',
      '[class*="agenda"]',
      '[class*="event"]',
      '.post',
      'article'
    ];

    console.log('Analyzing HTML structure...\n');

    selectors.forEach(selector => {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`Found ${elements.length} elements matching "${selector}":`);
        elements.each((i, el) => {
          if (i < 3) { // Only show first 3 elements to avoid too much output
            console.log(`\nElement ${i + 1}:`);
            const classes = $(el).attr('class');
            console.log('Classes:', classes || 'none');
            console.log('HTML structure:');
            const html = $(el).html();
            if (html) {
              console.log(html.slice(0, 500) + '...\n');
            }
          }
        });
        if (elements.length > 3) {
          console.log(`... and ${elements.length - 3} more elements\n`);
        }
      }
    });

    // Look for any forms that might be used for filtering
    console.log('\nAnalyzing filter forms...');
    $('form').each((i, form) => {
      console.log(`\nForm ${i + 1}:`);
      console.log('Action:', $(form).attr('action'));
      console.log('Method:', $(form).attr('method'));
      console.log('ID:', $(form).attr('id'));
      
      // Log form fields
      const fields = $(form).find('input, select');
      if (fields.length > 0) {
        console.log('\nForm fields:');
        fields.each((_, field) => {
          const name = $(field).attr('name');
          const type = $(field).attr('type');
          const tagName = $(field).prop('tagName');
          const fieldType = type || (typeof tagName === 'string' ? tagName.toLowerCase() : 'unknown');
          const value = $(field).attr('value');
          if (name) {
            console.log(`- ${name} (${fieldType})${value ? ': ' + value : ''}`);
          }
        });
      }
    });

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Request failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }
}

main(); 