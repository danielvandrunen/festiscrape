import axios from 'axios';

async function main() {
  try {
    const response = await axios.get('https://festileaks.com/festivalagenda/');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('\nHTML content:');
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching Festileaks:', error);
    process.exit(1);
  }
}

main(); 