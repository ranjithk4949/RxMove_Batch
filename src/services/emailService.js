import { emailTransporter } from '../config/email.js';
import { logger } from '../config/logger.js';
import { formatCurrency } from '../utils/formatters.js';
import { renderTemplate } from './templateService.js';

/**
 * Send daily report email with PDF attachment
 */
export async function sendDailyReportEmail(pharmacy, orders, pdfBuffer, dateString) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.warn('Email credentials not configured, skipping email send');
      return;
    }
    
    logger.info(`Sending daily report email to ${pharmacy.email}`);
    
    // Calculate summary for email
    const stats = {
      totalOrders: orders.length,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.fare || 0), 0),
      totalToCollect: orders.reduce((sum, order) => sum + parseFloat(order.amt_need_to_collect || 0), 0),
      totalCollected: orders.reduce((sum, order) => sum + parseFloat(order.amt_collected || 0), 0)
    };
    
    // Prepare email template data
    const emailData = {
      pharmacy: {
        name: pharmacy.business_name || pharmacy.name
      },
      reportDate: dateString,
      stats: {
        ...stats,
        totalRevenueFormatted: formatCurrency(stats.totalRevenue),
        totalToCollectFormatted: formatCurrency(stats.totalToCollect),
        totalCollectedFormatted: formatCurrency(stats.totalCollected),
        deliveryRate: stats.totalOrders > 0 ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0
      },
      company: {
        name: process.env.COMPANY_NAME || 'RxMove',
        email: process.env.COMPANY_EMAIL || 'reports@rxmove.ca',
        phone: process.env.COMPANY_PHONE || '902-403-9507'
      }
    };
    
    // Render email HTML
    const emailHtml = await renderTemplate('email-daily', emailData);
    
    // Generate filename
    const fileName = `RxMove_Daily_Report_${pharmacy.business_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Pharmacy'}_${dateString.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    
    // Send email
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'RxMove'} Reports" <${process.env.EMAIL_USER}>`,
      to: pharmacy.email,
      subject: `Daily Delivery Report - ${dateString}`,
      html: emailHtml,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };
    
    const result = await emailTransporter.sendMail(mailOptions);
    logger.info(`Daily report email sent successfully to ${pharmacy.email}. Message ID: ${result.messageId}`);
    
    return result;
    
  } catch (error) {
    logger.error(`Error sending daily report email to ${pharmacy.email}:`, error);
    throw error;
  }
}

/**
 * Send monthly report email with PDF attachment
 */
export async function sendMonthlyReportEmail(billingData, pdfBuffer) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.warn('Email credentials not configured, skipping email send');
      return;
    }
    
    const pharmacy = billingData.pharmacy;
    logger.info(`Sending monthly report email to ${pharmacy.email}`);
    
    // Prepare email template data
    const emailData = {
      pharmacy: {
        name: pharmacy.business_name || pharmacy.name
      },
      reportPeriod: billingData.reportPeriod,
      invoiceNumber: billingData.invoiceNumber,
      stats: {
        ...billingData.monthlyStats,
        totalRevenueFormatted: formatCurrency(billingData.monthlyStats.totalDeliveryRevenue),
        totalToCollectFormatted: formatCurrency(billingData.monthlyStats.totalToCollect),
        totalCollectedFormatted: formatCurrency(billingData.monthlyStats.totalCollected),
        averageOrderValueFormatted: formatCurrency(billingData.monthlyStats.averageOrderValue),
        deliveryRate: billingData.monthlyStats.totalOrders > 0 
          ? Math.round((billingData.monthlyStats.deliveredOrders / billingData.monthlyStats.totalOrders) * 100) 
          : 0
      },
      billing: {
        appFeeFormatted: formatCurrency(billingData.appFee),
        totalAmountDueFormatted: formatCurrency(billingData.totalAmountDue)
      },
      company: {
        name: process.env.COMPANY_NAME || 'RxMove',
        email: process.env.COMPANY_EMAIL || 'reports@rxmove.ca',
        phone: process.env.COMPANY_PHONE || '902-403-9507'
      }
    };
    
    // Render email HTML
    const emailHtml = await renderTemplate('email-monthly', emailData);
    
    // Generate filename
    const fileName = `RxMove_Monthly_Invoice_${pharmacy.business_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Pharmacy'}_${billingData.year}_${billingData.month.toString().padStart(2, '0')}.pdf`;
    
    // Send email
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'RxMove'} Billing" <${process.env.EMAIL_USER}>`,
      to: pharmacy.email,
      subject: `Monthly Invoice - ${billingData.reportPeriod} (${billingData.invoiceNumber})`,
      html: emailHtml,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };
    
    const result = await emailTransporter.sendMail(mailOptions);
    logger.info(`Monthly report email sent successfully to ${pharmacy.email}. Message ID: ${result.messageId}`);
    
    return result;
    
  } catch (error) {
    logger.error(`Error sending monthly report email to ${pharmacy.email}:`, error);
    throw error;
  }
}
