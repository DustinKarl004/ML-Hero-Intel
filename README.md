# ML Hero Intel

A comprehensive platform for Mobile Legends: Bang Bang players to access up-to-date hero information, builds, counters, and trends.

## Project Overview

ML Hero Intel automatically scrapes and aggregates hero data from various trusted sources in the Mobile Legends community, presenting it in a clean, user-friendly interface. Users can browse heroes, view detailed statistics, save favorites, and stay updated on the latest meta.

## Features

- **Comprehensive Hero Database**: Access detailed information on all Mobile Legends heroes
- **Automated Data Collection**: Regular updates from trusted MLBB sources
- **User Authentication**: Create accounts to save favorite heroes and preferences
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Hero Details**: View builds, counters, stats, and patch notes for each hero
- **Admin Dashboard**: Trigger manual data updates and view scraping logs

## Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- Firebase Authentication
- Vercel (deployment)

### Backend
- Firebase Cloud Functions
- Firestore Database
- Node.js
- Puppeteer (for web scraping)

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Firebase account
- Vercel account (for deployment)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ml-hero-intel.git
   cd ml-hero-intel
   ```

2. Install dependencies for both frontend and backend:
   ```
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local` in the frontend directory
   - Copy `.env.example` to `.env` in the backend directory
   - Fill in your Firebase configuration details

4. Run the development servers:
   ```
   # Frontend
   cd frontend
   npm run dev
   
   # Backend (Firebase emulators)
   cd ../backend
   firebase emulators:start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
ml-hero-intel/
├── frontend/               # Next.js application
│   ├── components/         # React components
│   ├── contexts/           # React contexts (auth, etc.)
│   ├── pages/              # Next.js pages
│   ├── public/             # Static assets
│   ├── services/           # API services
│   ├── styles/             # CSS styles
│   ├── utils/              # Utility functions
│   └── DEPLOYMENT.md       # Frontend deployment guide
│
├── backend/                # Firebase backend
│   ├── functions/          # Cloud Functions
│   ├── scrapers/           # Web scraping scripts
│   ├── firestore.rules     # Firestore security rules
│   └── DEPLOYMENT.md       # Backend deployment guide
│
└── README.md               # Project documentation
```

## Deployment

For detailed deployment instructions, see:
- [Frontend Deployment Guide](frontend/DEPLOYMENT.md)
- [Backend Deployment Guide](backend/DEPLOYMENT.md)

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