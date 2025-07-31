import dotenv from 'dotenv';
import { startScheduler } from './jobs/scheduler.js';
import { logger } from './config/logger.js';
import { testDatabaseConnection } from './config/database.js';

// Load environment variables
dotenv.config();

async function startApplication() {
  try {
    logger.info('Starting RxMove Batch Jobs System...');
    
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }
    
    logger.info('Database connection successful');
    
    // Start the scheduler
    startScheduler();
    
    logger.info('Batch jobs system started successfully');
    logger.info('Scheduled jobs:');
    logger.info('- Daily Reports: Every day at 9:00 AM EST');
    logger.info('- Monthly Reports: 1st day of each month at 10:00 AM EST');
    
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

// Start the application
startApplication();
