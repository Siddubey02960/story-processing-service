require('dotenv').config();
const { startConsumer } = require('../src/utils/kafka');

(async () => {
  try {
    console.log('Starting Story Processor Service...');
    await startConsumer();
  } catch (error) {
    console.error('Failed to start the service:', error);
    process.exit(1);
  }
})();
