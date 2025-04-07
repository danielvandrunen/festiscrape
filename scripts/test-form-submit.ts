import axios from 'axios';

async function main() {
  try {
    // First, fetch the page to get the nonce and other configuration
    const pageResponse = await axios.get('https://festileaks.com/festivalagenda/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });

    // Extract nonce from the page content
    const nonceMatch = pageResponse.data.match(/wp\s*=\s*{[^}]*"nonce"\s*:\s*"([^"]+)"/);
    const nonce = nonceMatch ? nonceMatch[1] : '';
    console.log('Found nonce:', nonce);

    // Get cookies from the page response
    const cookies = pageResponse.headers['set-cookie'];
    const cookieHeader = cookies ? cookies.map(cookie => cookie.split(';')[0]).join('; ') : '';

    // Prepare form data
    const formData = new URLSearchParams({
      'action': 'filter_events',
      '_wpnonce': nonce,
      'event_startdate': new Date().toISOString().split('T')[0],
      'event_enddate': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      'event_country': '',
      'event_city': '',
      'event_artist': '',
      'event_genre': '',
      'event_minprice': '',
      'event_maxprice': '',
      'event_mincapacity': '',
      'event_maxcapacity': '',
      'event_organizer': '',
      'event_multiday': '',
      'event_soldout': '',
      'event_cancelled': ''
    });

    // Make the AJAX request
    const response = await axios.post('https://festileaks.com/wp-admin/admin-ajax.php', formData, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*',
        'Origin': 'https://festileaks.com',
        'Referer': 'https://festileaks.com/festivalagenda/',
        'Cookie': cookieHeader,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Request failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config
      });
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }
}

main(); 