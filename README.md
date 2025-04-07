# Festiscrape

Festiscrape is a web application for discovering and tracking music festivals. It allows users to browse festivals, mark favorites, and add notes.

## Features

- Browse festivals from multiple sources
- Filter festivals by date, location, and more
- Mark festivals as favorites
- Add notes to festivals
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database)
- **Deployment**: Vercel/Netlify/Supabase Hosting

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/festiscrape.git
   cd festiscrape
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Supabase credentials
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on how to deploy the application.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 