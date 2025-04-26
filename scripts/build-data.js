const { runAllScrapers } = require('./scrapers');

console.log('Starting data build process...');

runAllScrapers()
  .then(() => {
    console.log('Data build process completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Data build process failed:', error);
    process.exit(1);
  }); 