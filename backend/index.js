require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { runAllScrapers } = require('./scrapers/index');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('ML Hero Intel Backend API');
});

// Manual trigger for scraping
app.post('/api/scrape', async (req, res) => {
  try {
    console.log('Manual scraping triggered...');
    await runAllScrapers();
    res.status(200).json({ success: true, message: 'Scraping completed successfully' });
  } catch (error) {
    console.error('Error during manual scraping:', error);
    res.status(500).json({ success: false, message: 'Error during scraping', error: error.message });
  }
});

// Schedule automatic scraping (once per day at midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled scraping...');
  try {
    await runAllScrapers();
    console.log('Scheduled scraping completed successfully');
  } catch (error) {
    console.error('Error during scheduled scraping:', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Expose function to be called directly for manual testing
module.exports = { runAllScrapers }; 