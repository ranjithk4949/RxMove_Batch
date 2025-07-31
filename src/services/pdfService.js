import puppeteer from 'puppeteer';
import { logger } from '../config/logger.js';
import { formatCurrency, formatDistance } from '../utils/formatters.js';
import { renderTemplate } from './templateService.js';

/**
 * Generate daily report PDF for a pharmacy
 */
export async function generateDailyReportPDF(pharmacy, orders, dateString) {
  let browser;
  
  try {
    logger.info(`Generating daily PDF report for ${pharmacy.business_name || pharmacy.name}`);
    
    // Calculate summary statistics
    const stats = {
      totalOrders: orders.length,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.fare || 0), 0),
      totalToCollect: orders.reduce((sum, order) => sum + parseFloat(order.amt_need_to_collect || 0), 0),
      totalCollected: orders.reduce((sum, order) => sum + parseFloat(order.amt_collected || 0), 0),
      totalDistance: orders.reduce((sum, order) => sum + parseFloat(order.distance || 0), 0)
    };
    
    // Prepare template data
    const templateData = {
      pharmacy: {
        name: pharmacy.business_name || pharmacy.name,
        email: pharmacy.email,
        phone: pharmacy.phone,
        address: pharmacy.address
      },
      reportDate: dateString,
      generatedDate: new Date().toLocaleDateString('en-US', {
        timeZone: 'America/Toronto',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      stats: {
        ...stats,
        totalRevenueFormatted: formatCurrency(stats.totalRevenue),
        totalToCollectFormatted: formatCurrency(stats.totalToCollect),
        totalCollectedFormatted: formatCurrency(stats.totalCollected),
        totalDistanceFormatted: formatDistance(stats.totalDistance),
        deliveryRate: stats.totalOrders > 0 ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0
      },
      orders: orders.map(order => ({
        ...order,
        fareFormatted: formatCurrency(parseFloat(order.fare || 0)),
        amtNeedToCollectFormatted: formatCurrency(parseFloat(order.amt_need_to_collect || 0)),
        amtCollectedFormatted: formatCurrency(parseFloat(order.amt_collected || 0)),
        distanceFormatted: formatDistance(parseFloat(order.distance || 0)),
        createdAtFormatted: new Date(order.created_at).toLocaleString('en-US', {
          timeZone: 'America/Toronto',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        statusFormatted: order.status.replace('_', ' ').toUpperCase()
      })),
      company: {
        name: process.env.COMPANY_NAME || 'RxMove',
        email: process.env.COMPANY_EMAIL || 'reports@rxmove.ca',
        phone: process.env.COMPANY_PHONE || '902-403-9507',
        address: process.env.COMPANY_ADDRESS || 'Halifax, NS, Canada'
      }
    };
    
    // Render HTML template
    const html = await renderTemplate('daily-report', templateData);
    
    // Generate PDF using Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    logger.info(`Daily PDF report generated successfully for ${pharmacy.business_name || pharmacy.name}`);
    return pdfBuffer;
    
  } catch (error) {
    logger.error('Error generating daily PDF report:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate monthly report PDF for a pharmacy
 */
export async function generateMonthlyReportPDF(billingData) {
  let browser;
  
  try {
    logger.info(`Generating monthly PDF report for ${billingData.pharmacy.business_name || billingData.pharmacy.name}`);
    
    // Add formatted data for template
    const templateData = {
      ...billingData,
      stats: {
        ...billingData.monthlyStats,
        totalRevenueFormatted: formatCurrency(billingData.monthlyStats.totalDeliveryRevenue),
        totalToCollectFormatted: formatCurrency(billingData.monthlyStats.totalToCollect),
        totalCollectedFormatted: formatCurrency(billingData.monthlyStats.totalCollected),
        totalDistanceFormatted: formatDistance(billingData.monthlyStats.totalDistance),
        averageOrderValueFormatted: formatCurrency(billingData.monthlyStats.averageOrderValue),
        deliveryRate: billingData.monthlyStats.totalOrders > 0 
          ? Math.round((billingData.monthlyStats.deliveredOrders / billingData.monthlyStats.totalOrders) * 100) 
          : 0
      },
      appFeeFormatted: formatCurrency(billingData.appFee),
      totalAmountDueFormatted: formatCurrency(billingData.totalAmountDue),
      orders: billingData.orders.map(order => ({
        ...order,
        fareFormatted: formatCurrency(parseFloat(order.fare || 0)),
        amtNeedToCollectFormatted: formatCurrency(parseFloat(order.amt_need_to_collect || 0)),
        amtCollectedFormatted: formatCurrency(parseFloat(order.amt_collected || 0)),
        distanceFormatted: formatDistance(parseFloat(order.distance || 0)),
        createdAtFormatted: new Date(order.created_at).toLocaleDateString('en-US', {
          timeZone: 'America/Toronto',
          month: 'short',
          day: 'numeric'
        }),
        statusFormatted: order.status.replace('_', ' ').toUpperCase()
      })),
      company: {
        name: process.env.COMPANY_NAME || 'RxMove',
        email: process.env.COMPANY_EMAIL || 'reports@rxmove.ca',
        phone: process.env.COMPANY_PHONE || '902-403-9507',
        address: process.env.COMPANY_ADDRESS || 'Halifax, NS, Canada'
      }
    };
    
    // Render HTML template
    const html = await renderTemplate('monthly-report', templateData);
    
    // Generate PDF using Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    logger.info(`Monthly PDF report generated successfully for ${billingData.pharmacy.business_name || billingData.pharmacy.name}`);
    return pdfBuffer;
    
  } catch (error) {
    logger.error('Error generating monthly PDF report:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
