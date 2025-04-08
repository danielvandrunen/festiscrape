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
    
    // Find and log all script tags
    console.log('Analyzing script tags...');
    $('script').each((i, script) => {
      const content = $(script).html();
      if (content) {
        // Look for AJAX-related code
        if (content.includes('ajax') || content.includes('filter_events') || content.includes('wp-admin')) {
          console.log(`\nFound relevant script ${i}:`);
          console.log(content);
        }
      }
    });

    // Find and log the form structure
    console.log('\nAnalyzing form structure...');
    $('form').each((i, form) => {
      console.log(`\nForm ${i}:`);
      console.log('Action:', $(form).attr('action'));
      console.log('Method:', $(form).attr('method'));
      console.log('ID:', $(form).attr('id'));
      console.log('Class:', $(form).attr('class'));
    });

    // Find any data attributes that might contain configuration
    console.log('\nAnalyzing data attributes...');
    $('[data-*]').each((i, el) => {
      const attrs = $(el).attr() || {};
      if (Object.keys(attrs).length > 0) {
        const dataAttrs = Object.keys(attrs).filter(key => key.startsWith('data-'));
        if (dataAttrs.length > 0) {
          console.log(`\nElement ${i} (${el.tagName}):`);
          dataAttrs.forEach(attr => {
            console.log(`${attr}:`, attrs[attr]);
          });
        }
      }
    });

    // Look for any wp-json endpoints
    console.log('\nAnalyzing links for API endpoints...');
    $('link[rel="https://api.w.org/"]').each((i, link) => {
      console.log('WP API endpoint:', $(link).attr('href'));
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