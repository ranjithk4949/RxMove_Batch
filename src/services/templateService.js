import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../config/logger.js';

// Template cache
const templateCache = new Map();

/**
 * Register Handlebars helpers
 */
function registerHelpers() {
  // Currency formatting helper
  Handlebars.registerHelper('currency', function(amount) {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(parseFloat(amount) || 0);
  });
  
  // Date formatting helper
  Handlebars.registerHelper('formatDate', function(date, format) {
    const d = new Date(date);
    switch (format) {
      case 'short':
        return d.toLocaleDateString('en-US', {
          timeZone: 'America/Toronto',
          month: 'short',
          day: 'numeric'
        });
      case 'long':
        return d.toLocaleDateString('en-US', {
          timeZone: 'America/Toronto',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'time':
        return d.toLocaleTimeString('en-US', {
          timeZone: 'America/Toronto',
          hour: '2-digit',
          minute: '2-digit'
        });
      default:
        return d.toLocaleDateString('en-US', {
          timeZone: 'America/Toronto'
        });
    }
  });
  
  // Number formatting helper
  Handlebars.registerHelper('number', function(num, decimals = 1) {
    return parseFloat(num || 0).toFixed(decimals);
  });
  
  // Conditional helper
  Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });
  
  // Math helpers
  Handlebars.registerHelper('add', function(a, b) {
    return parseFloat(a || 0) + parseFloat(b || 0);
  });
  
  Handlebars.registerHelper('multiply', function(a, b) {
    return parseFloat(a || 0) * parseFloat(b || 0);
  });
  
  // Status formatting helper
  Handlebars.registerHelper('statusClass', function(status) {
    switch (status) {
      case 'delivered': return 'status-delivered';
      case 'in_progress': return 'status-progress';
      case 'yet_to_pickup': return 'status-pending';
      default: return 'status-default';
    }
  });
}

/**
 * Load and compile template
 */
async function loadTemplate(templateName) {
  try {
    if (templateCache.has(templateName)) {
      return templateCache.get(templateName);
    }
    
    const templatePath = path.join(process.cwd(), 'src', 'templates', `${templateName}.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const compiledTemplate = Handlebars.compile(templateContent);
    
    templateCache.set(templateName, compiledTemplate);
    return compiledTemplate;
    
  } catch (error) {
    logger.error(`Error loading template ${templateName}:`, error);
    throw error;
  }
}

/**
 * Render template with data
 */
export async function renderTemplate(templateName, data) {
  try {
    // Register helpers if not already done
    if (!Handlebars.helpers.currency) {
      registerHelpers();
    }
    
    const template = await loadTemplate(templateName);
    return template(data);
    
  } catch (error) {
    logger.error(`Error rendering template ${templateName}:`, error);
    throw error;
  }
}

/**
 * Clear template cache (useful for development)
 */
export function clearTemplateCache() {
  templateCache.clear();
  logger.info('Template cache cleared');
}
