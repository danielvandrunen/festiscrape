import axios from 'axios';

async function main() {
  try {
    // Try the REST API endpoint
    const response = await axios.get('https://festileaks.com/wp-json/wp/v2/festivals', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('\nAPI response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching festival data:', error);
    process.exit(1);
  }
}

main(); 