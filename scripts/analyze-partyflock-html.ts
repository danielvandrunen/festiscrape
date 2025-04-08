import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

interface Festival {
  name: string;
  location: string;
  date: string;
  url: string;
  attendees?: number;
  last_updated: Date;
}

async function analyzePartyflockHtml() {
  try {
    // Read the HTML file
    const htmlPath = path.join(process.cwd(), 'test-data', 'festivals & strandfeesten · festival agenda.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    
    // Load the HTML into cheerio
    const $ = cheerio.load(html);
    
    console.log('Analyzing Partyflock HTML structure...\n');
    
    const festivals: Festival[] = [];
    
    // Find all festival rows in the tables
    $('tbody.hl').each((i, element) => {
      const $row = $(element).find('tr').first();
      if (!$row.length) return;
      
      // Get the date from the previous tbody.party-day
      const $dayRow = $(element).prev('tbody.party-day');
      const dateText = $dayRow.find('time').attr('datetime') || '';
      
      // Get festival info from the row
      const $cells = $row.find('td');
      const $nameCell = $cells.eq(0);
      const $attendeesCell = $cells.eq(1);
      const $locationCell = $cells.eq(2);
      
      const $link = $nameCell.find('a').first();
      const name = $link.text().trim();
      const url = $link.attr('href') || '';
      
      // Get attendees count (number before the image)
      const attendeesText = $attendeesCell.text().trim();
      const attendees = parseInt(attendeesText) || undefined;
      
      // Get location from the first link in the location cell
      const $locationLink = $locationCell.find('a').first();
      const location = $locationLink.length ? $locationLink.text().trim() : $locationCell.text().trim();
      
      if (name && location) {
        festivals.push({
          name,
          location,
          date: dateText,
          url: url.startsWith('http') ? url : `https://partyflock.nl${url}`,
          attendees,
          last_updated: new Date()
        });
      }
    });
    
    console.log(`Found ${festivals.length} festivals\n`);
    console.log('First 5 festivals:');
    festivals.slice(0, 5).forEach(festival => {
      console.log(`- ${festival.name}`);
      console.log(`  Location: ${festival.location}`);
      console.log(`  Date: ${festival.date}`);
      console.log(`  Attendees: ${festival.attendees || 'N/A'}`);
      console.log(`  URL: ${festival.url}\n`);
    });
    
    // Save the festivals to a JSON file
    const outputPath = path.join(process.cwd(), 'data', 'festivals.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(festivals, null, 2));
    console.log(`\nSaved ${festivals.length} festivals to ${outputPath}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

analyzePartyflockHtml(); 