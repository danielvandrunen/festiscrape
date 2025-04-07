import axios from 'axios';

async function main() {
  try {
    // Try different WordPress REST API endpoints
    const endpoints = [
      'https://festileaks.com/wp-json/wp/v2/posts?categories=festivals',
      'https://festileaks.com/wp-json/wp/v2/posts?per_page=10',
      'https://festileaks.com/wp-json/wp/v2/categories',
      'https://festileaks.com/wp-json/',
      'https://festileaks.com/wp-json/wp/v2/pages/243126' // Festival agenda page ID from earlier
    ];

    for (const endpoint of endpoints) {
      console.log(`\nTrying endpoint: ${endpoint}`);
      try {
        const response = await axios.get(endpoint, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json'
          }
        });

        console.log('Status:', response.status);
        if (response.data) {
          if (Array.isArray(response.data)) {
            console.log('Found', response.data.length, 'items');
            if (response.data.length > 0) {
              console.log('First item:', JSON.stringify(response.data[0], null, 2));
            }
          } else {
            console.log('Response:', JSON.stringify(response.data, null, 2));
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Error for endpoint', endpoint + ':', {
            status: error.response?.status,
            statusText: error.response?.statusText
          });
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 