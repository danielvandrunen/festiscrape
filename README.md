# FestiScrape

A web application that aggregates festival data from multiple sources into a single, searchable calendar interface.

## Features

- Aggregates festival data from multiple sources:
  - Festileaks
  - Festivalinfo
  - EBLive
  - Follow the Beat
- Clean, Stripe-inspired UI
- Advanced filtering and search capabilities
- Festival archiving and interest tracking
- Automatic website URL enrichment
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Data Collection**: Node.js with Cheerio for web scraping
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/festiscrape.git
   cd festiscrape
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```bash
   cp .env.local.example .env.local
   ```

4. Update the `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Set up the database:
   - Create a new Supabase project
   - Run the SQL script in `scripts/setup-db.sql` in the Supabase SQL editor

6. Start the development server:
   ```bash
   npm run dev
   ```

### Data Collection

To collect festival data:

1. Run the scraping script:
   ```bash
   npm run scrape
   ```

2. The script will:
   - Scrape data from all configured sources
   - Remove duplicates
   - Save the results to `data/festivals.json`
   - Upload the data to Supabase

## Development

### Project Structure

```
festiscrape/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/             # Utility functions and configurations
│   └── types/           # TypeScript type definitions
├── scripts/
│   └── scrapers/        # Web scraping scripts
└── public/              # Static assets
```

### Adding a New Scraper

1. Create a new file in `scripts/scrapers/`
2. Extend the `BaseScraper` class
3. Implement the required methods
4. Add the scraper to `scripts/scrape-all.ts`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 