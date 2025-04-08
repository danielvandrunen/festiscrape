import axios from 'axios';

async function fetchPartyflock() {
  const url = 'https://partyflock.nl/agenda/festivals';
  console.log(`Attempting to fetch: ${url}`);
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    console.log(`Status: ${response.status}`);
    console.log('Content snippet:');
    console.log(response.data.substring(0, 1000)); // Print first 1000 chars
    
    if (response.data.length < 500) { // Check if content seems too short
        console.warn("Warning: Fetched content might be too short, possibly blocked?");
    }
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching Partyflock: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error('Response data snippet:');
        console.error(String(error.response.data).substring(0, 500));
      }
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
}

fetchPartyflock(); 