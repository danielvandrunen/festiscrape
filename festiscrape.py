import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

def scrape_festivals():
    # Set up headers to mimic a browser
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
    
    # Make the request
    url = 'https://partyflock.nl/agenda/festivals'
    response = requests.get(url, headers=headers)
    
    # Parse the HTML
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find all festival entries
    festivals = []
    festival_entries = soup.find_all('tbody', class_='hl')
    
    for entry in festival_entries:
        try:
            # Get festival name
            name_tag = entry.find('span', itemprop='name')
            name = name_tag.text if name_tag else 'Unknown'
            
            # Get date
            date_tag = entry.find('meta', itemprop='startDate')
            date = date_tag['content'] if date_tag else None
            
            # Get location
            location_tag = entry.find('a', href=lambda x: x and '/location/' in x)
            location = location_tag.text if location_tag else 'Unknown'
            
            # Get city
            city_tag = entry.find('span', class_='nowrap light7').find('a')
            city = city_tag.text if city_tag else 'Unknown'
            
            # Get country
            country_tag = entry.find('meta', itemprop='addressCountry')
            country = country_tag['content'] if country_tag else 'Unknown'
            
            # Create festival entry
            festival = {
                'name': name,
                'date': date,
                'location': location,
                'city': city,
                'country': country
            }
            
            festivals.append(festival)
            
        except Exception as e:
            print(f"Error processing festival entry: {e}")
            continue
    
    return festivals

def save_festivals(festivals):
    # Save to JSON file
    with open('festivals.json', 'w', encoding='utf-8') as f:
        json.dump(festivals, f, ensure_ascii=False, indent=2)
    
    # Print summary
    print(f"\nScraped {len(festivals)} festivals")
    print("Data saved to festivals.json")

if __name__ == "__main__":
    festivals = scrape_festivals()
    save_festivals(festivals) 