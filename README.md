# ML Hero Intel - Frontend

A comprehensive platform for Mobile Legends: Bang Bang players to access up-to-date hero information, builds, counters, and trends.

## Overview

This is a static frontend for ML Hero Intel that works without a database. It automatically scrapes hero data during the build process and stores it as static JSON files, making it perfect for deployment on platforms like Vercel.

## Features

- **Comprehensive Hero Database**: Access detailed information on all Mobile Legends heroes
- **Automated Data Collection**: Data is scraped from trusted MLBB sources during build
- **Local Favorites**: Save favorite heroes in your browser's localStorage
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Hero Details**: View builds, counters, stats, and patch notes for each hero

## Tech Stack

- Next.js
- React
- Tailwind CSS
- Cheerio (for web scraping)
- Vercel (for deployment)

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ml-hero-intel.git
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```
npm run build
npm run start
```

### Manual Data Update

To manually update the hero data without running the full build:

```
npm run scrape
```

## Deployment

This project is designed to be deployed directly to Vercel:

1. Connect your GitHub repository to Vercel
2. Deploy with default settings (build command is already configured)
3. Vercel will automatically run the scraper during the build process

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Data sources include official Mobile Legends game data and community resources
- Icons and images are property of Moonton
- This is a fan project and is not affiliated with or endorsed by Moonton or Mobile Legends: Bang Bang 