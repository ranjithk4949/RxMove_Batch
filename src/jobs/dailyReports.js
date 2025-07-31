import { logger } from '../config/logger.js';
import { getPharmaciesWithOrders, getPharmacyDailyOrders } from '../services/dataService.js';
import { generateDailyReportPDF } from '../services/pdfService.js';
import { sendDailyReportEmail } from '../services/emailService.js';
import { getYesterdayDateRange } from '../utils/dateUtils.js';

export async function generateDailyReports() {
  const startTime = new Date();
  logger.info('Starting daily reports generation...');
  
  try {
    // Get yesterday's date range in Toronto timezone
    const { startDate, endDate, dateString } = getYesterdayDateRange();
    
    logger.info(`Generating daily reports for: ${dateString}`);
    
    // Get all pharmacies that had orders yesterday
    const pharmacies = await getPharmaciesWithOrders(startDate, endDate);
    
    if (pharmacies.length === 0) {
      logger.info('No pharmacies with orders found for yesterday');
      return;
    }
    
    logger.info(`Found ${pharmacies.length} pharmacies with orders`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each pharmacy
    for (const pharmacy of pharmacies) {
      try {
        logger.info(`Processing daily report for: ${pharmacy.business_name || pharmacy.name}`);
        
        // Get pharmacy's orders for yesterday
        const orders = await getPharmacyDailyOrders(pharmacy.id, startDate, endDate);
        
        if (orders.length === 0) {
          logger.warn(`No orders found for pharmacy: ${pharmacy.name}`);
          continue;
        }
        
        // Generate PDF report
        const pdfBuffer = await generateDailyReportPDF(pharmacy, orders, dateString);
        
        // Send email with PDF attachment
        await sendDailyReportEmail(pharmacy, orders, pdfBuffer, dateString);
        
        successCount++;
        logger.info(`Daily report sent successfully to: ${pharmacy.email}`);
        
      } catch (error) {
        errorCount++;
        logger.error(`Failed to process daily report for pharmacy ${pharmacy.id}:`, error);
        // Continue with next pharmacy
      }
    }
    
    const duration = new Date() - startTime;
    logger.info(`Daily reports generation completed in ${duration}ms`);
    logger.info(`Results: ${successCount} successful, ${errorCount} failed`);
    
    return {
      success: true,
      processed: pharmacies.length,
      successful: successCount,
      failed: errorCount,
      duration
    };
    
  } catch (error) {
    logger.error('Daily reports generation failed:', error);
    throw error;
  }
}

// Export for manual execution
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDailyReports()
    .then((result) => {
      logger.info('Manual daily reports execution completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Manual daily reports execution failed:', error);
      process.exit(1);
    });
}
