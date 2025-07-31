import cron from 'node-cron';
import { generateDailyReports } from './dailyReports.js';
import { generateMonthlyReports } from './monthlyReports.js';
import { logger } from '../config/logger.js';

export function startScheduler() {
  logger.info('Starting job scheduler...');
  
  // Daily Reports - Every day at 9:00 AM EST
  // Cron: '0 9 * * *' in EST (considering timezone)
  cron.schedule('0 14 * * *', async () => {
    logger.info('Starting scheduled daily reports job...');
    try {
      await generateDailyReports();
      logger.info('Daily reports job completed successfully');
    } catch (error) {
      logger.error('Daily reports job failed:', error);
    }
  }, {
    scheduled: true,
    timezone: 'America/Toronto'
  });
  
  // Monthly Reports - 1st day of each month at 10:00 AM EST
  // Cron: '0 10 1 * *' in EST
  cron.schedule('0 15 1 * *', async () => {
    logger.info('Starting scheduled monthly reports job...');
    try {
      await generateMonthlyReports();
      logger.info('Monthly reports job completed successfully');
    } catch (error) {
      logger.error('Monthly reports job failed:', error);
    }
  }, {
    scheduled: true,
    timezone: 'America/Toronto'
  });
  
  // Health check job - Every hour
  cron.schedule('0 * * * *', () => {
    logger.info('Health check: Batch jobs system is running');
  }, {
    scheduled: true,
    timezone: 'America/Toronto'
  });
  
  logger.info('Job scheduler started with timezone: America/Toronto');
  logger.info('Scheduled jobs:');
  logger.info('- Daily Reports: 9:00 AM EST (14:00 UTC)');
  logger.info('- Monthly Reports: 1st of month, 10:00 AM EST (15:00 UTC)');
  logger.info('- Health Check: Every hour');
}
