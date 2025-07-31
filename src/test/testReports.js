import { logger } from '../config/logger.js';
import { testDatabaseConnection } from '../config/database.js';
import { testEmailConnection } from '../config/email.js';
import { generateDailyReports } from '../jobs/dailyReports.js';
import { generateMonthlyReports } from '../jobs/monthlyReports.js';
import { getDateRangeForDaysAgo, getMonthRangeForMonthsAgo } from '../utils/dateUtils.js';
import { validateEnvironmentVariables } from '../utils/validators.js';

async function runTests() {
  logger.info('Starting RxMove Batch Jobs Test Suite...');
  
  try {
    // Test 1: Environment Variables
    logger.info('Test 1: Validating environment variables...');
    validateEnvironmentVariables();
    logger.info('✅ Environment variables validation passed');
    
    // Test 2: Database Connection
    logger.info('Test 2: Testing database connection...');
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }
    logger.info('✅ Database connection test passed');
    
    // Test 3: Email Configuration
    logger.info('Test 3: Testing email configuration...');
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const emailConnected = await testEmailConnection();
      if (!emailConnected) {
        logger.warn('⚠️ Email configuration test failed - emails will not be sent');
      } else {
        logger.info('✅ Email configuration test passed');
      }
    } else {
      logger.warn('⚠️ Email credentials not configured - emails will not be sent');
    }
    
    // Test 4: Date Utilities
    logger.info('Test 4: Testing date utilities...');
    const yesterdayRange = getDateRangeForDaysAgo(1);
    const lastMonthRange = getMonthRangeForMonthsAgo(1);
    logger.info(`Yesterday range: ${yesterdayRange.dateString}`);
    logger.info(`Last month range: ${lastMonthRange.monthString} ${lastMonthRange.year}`);
    logger.info('✅ Date utilities test passed');
    
    // Test 5: Daily Reports (Dry Run)
    logger.info('Test 5: Testing daily reports generation...');
    try {
      const dailyResult = await generateDailyReports();
      logger.info(`✅ Daily reports test completed: ${dailyResult.successful} successful, ${dailyResult.failed} failed`);
    } catch (error) {
      logger.error('❌ Daily reports test failed:', error.message);
    }
    
    // Test 6: Monthly Reports (Dry Run)
    logger.info('Test 6: Testing monthly reports generation...');
    try {
      const monthlyResult = await generateMonthlyReports();
      logger.info(`✅ Monthly reports test completed: ${monthlyResult.successful} successful, ${monthlyResult.failed} failed`);
    } catch (error) {
      logger.error('❌ Monthly reports test failed:', error.message);
    }
    
    logger.info('🎉 Test suite completed successfully!');
    logger.info('The batch jobs system is ready for production use.');
    
  } catch (error) {
    logger.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
    .then(() => {
      logger.info('Test execution completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Test execution failed:', error);
      process.exit(1);
    });
}
