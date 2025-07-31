import { logger } from '../config/logger.js';
import { getAllActivePharmacies, getPharmacyMonthlyOrders } from '../services/dataService.js';
import { generateMonthlyReportPDF } from '../services/pdfService.js';
import { sendMonthlyReportEmail } from '../services/emailService.js';
import { getLastMonthDateRange } from '../utils/dateUtils.js';
import { formatCurrency } from '../utils/formatters.js';

const MONTHLY_APP_FEE = parseFloat(process.env.MONTHLY_APP_FEE) || 75.00;

export async function generateMonthlyReports() {
  const startTime = new Date();
  logger.info('Starting monthly reports generation...');
  
  try {
    // Get last month's date range in Toronto timezone
    const { startDate, endDate, monthString, year, month } = getLastMonthDateRange();
    
    logger.info(`Generating monthly reports for: ${monthString} ${year}`);
    
    // Get all active pharmacies (not just those with orders)
    const pharmacies = await getAllActivePharmacies();
    
    if (pharmacies.length === 0) {
      logger.info('No active pharmacies found');
      return;
    }
    
    logger.info(`Found ${pharmacies.length} active pharmacies`);
    
    let successCount = 0;
    let errorCount = 0;
    let totalAppFees = 0;
    let totalDeliveryRevenue = 0;
    
    // Process each pharmacy
    for (const pharmacy of pharmacies) {
      try {
        logger.info(`Processing monthly report for: ${pharmacy.business_name || pharmacy.name}`);
        
        // Get pharmacy's orders for last month
        const orders = await getPharmacyMonthlyOrders(pharmacy.id, startDate, endDate);
        
        // Calculate monthly totals
        const monthlyStats = calculateMonthlyStats(orders);
        
        // Generate invoice number
        const invoiceNumber = generateInvoiceNumber(pharmacy.id, year, month);
        
        // Calculate total amount due (app fee + delivery fees)
        const totalAmountDue = MONTHLY_APP_FEE + monthlyStats.totalDeliveryRevenue;
        
        const billingData = {
          pharmacy,
          orders,
          monthlyStats,
          invoiceNumber,
          monthString,
          year,
          month,
          appFee: MONTHLY_APP_FEE,
          totalAmountDue,
          reportPeriod: `${monthString} ${year}`,
          generatedDate: new Date().toLocaleDateString('en-US', {
            timeZone: 'America/Toronto',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        };
        
        // Generate PDF report
        const pdfBuffer = await generateMonthlyReportPDF(billingData);
        
        // Send email with PDF attachment
        await sendMonthlyReportEmail(billingData, pdfBuffer);
        
        successCount++;
        totalAppFees += MONTHLY_APP_FEE;
        totalDeliveryRevenue += monthlyStats.totalDeliveryRevenue;
        
        logger.info(`Monthly report sent successfully to: ${pharmacy.email}`);
        logger.info(`Invoice: ${invoiceNumber}, Amount Due: ${formatCurrency(totalAmountDue)}`);
        
      } catch (error) {
        errorCount++;
        logger.error(`Failed to process monthly report for pharmacy ${pharmacy.id}:`, error);
        // Continue with next pharmacy
      }
    }
    
    const duration = new Date() - startTime;
    logger.info(`Monthly reports generation completed in ${duration}ms`);
    logger.info(`Results: ${successCount} successful, ${errorCount} failed`);
    logger.info(`Total App Fees: ${formatCurrency(totalAppFees)}`);
    logger.info(`Total Delivery Revenue: ${formatCurrency(totalDeliveryRevenue)}`);
    
    return {
      success: true,
      processed: pharmacies.length,
      successful: successCount,
      failed: errorCount,
      totalAppFees,
      totalDeliveryRevenue,
      duration
    };
    
  } catch (error) {
    logger.error('Monthly reports generation failed:', error);
    throw error;
  }
}

function calculateMonthlyStats(orders) {
  const stats = {
    totalOrders: orders.length,
    deliveredOrders: orders.filter(o => o.status === 'delivered').length,
    totalDeliveryRevenue: orders.reduce((sum, order) => sum + parseFloat(order.fare || 0), 0),
    totalToCollect: orders.reduce((sum, order) => sum + parseFloat(order.amt_need_to_collect || 0), 0),
    totalCollected: orders.reduce((sum, order) => sum + parseFloat(order.amt_collected || 0), 0),
    averageOrderValue: 0,
    peakDeliveryDay: null,
    totalDistance: orders.reduce((sum, order) => sum + parseFloat(order.distance || 0), 0)
  };
  
  // Calculate average order value
  if (stats.totalOrders > 0) {
    stats.averageOrderValue = stats.totalDeliveryRevenue / stats.totalOrders;
  }
  
  // Find peak delivery day
  const dailyCounts = {};
  orders.forEach(order => {
    const day = new Date(order.created_at).toLocaleDateString('en-US', {
      timeZone: 'America/Toronto',
      weekday: 'long'
    });
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });
  
  if (Object.keys(dailyCounts).length > 0) {
    stats.peakDeliveryDay = Object.entries(dailyCounts)
      .reduce((a, b) => dailyCounts[a[0]] > dailyCounts[b[0]] ? a : b)[0];
  }
  
  return stats;
}

function generateInvoiceNumber(pharmacyId, year, month) {
  // Generate invoice number: RXM-YYYY-MM-PHARMACY_ID_SHORT
  const pharmacyShort = pharmacyId.substring(0, 8).toUpperCase();
  const monthPadded = month.toString().padStart(2, '0');
  return `RXM-${year}-${monthPadded}-${pharmacyShort}`;
}

// Export for manual execution
if (import.meta.url === `file://${process.argv[1]}`) {
  generateMonthlyReports()
    .then((result) => {
      logger.info('Manual monthly reports execution completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Manual monthly reports execution failed:', error);
      process.exit(1);
    });
}
