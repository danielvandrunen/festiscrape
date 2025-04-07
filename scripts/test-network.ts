import axios from 'axios';

async function main() {
  try {
    // Try the WordPress REST API first
    const apiResponse = await axios.get('https://festileaks.com/wp-json/wp/v2/festivals', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    
    console.log('API Response:', apiResponse.data);
  } catch (error) {
    console.log('API request failed, trying alternative endpoint...');
    
    try {
      // Try the agenda page with different parameters
      const formData = new URLSearchParams();
      formData.append('action', 'get_festivals');
      formData.append('nonce', ''); // We might need to extract this from the page
      formData.append('page', '1');
      formData.append('per_page', '100');
      
      const response = await axios.post('https://festileaks.com/wp-admin/admin-ajax.php', formData, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json, text/plain, */*',
          'Origin': 'https://festileaks.com',
          'Referer': 'https://festileaks.com/festivalagenda/'
        }
      });
      
      console.log('Alternative Response:', response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      } else {
        console.error('Error:', error);
      }
    }
  }
}

main().catch(console.error); 