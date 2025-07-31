/**
 * Validate email address format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone) {
  if (!phone) return false;
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Check for valid North American phone number (10 or 11 digits)
  return digits.length === 10 || (digits.length === 11 && digits[0] === '1');
}

/**
 * Validate Canadian postal code
 */
export function isValidPostalCode(postalCode) {
  if (!postalCode) return false;
  
  // Canadian postal code pattern: A1A 1A1 or A1A1A1
  const postalCodeRegex = /^[A-Za-z]\d[A-Za-z][\s-]?\d[A-Za-z]\d$/;
  return postalCodeRegex.test(postalCode.trim());
}

/**
 * Validate address contains required components
 */
export function isValidAddress(address) {
  if (!address || address.trim().length < 10) {
    return false;
  }
  
  const addressLower = address.toLowerCase();
  
  // Check for Canadian postal code or common location indicators
  const hasPostalCode = isValidPostalCode(address);
  const hasCanadianLocation = addressLower.includes('ontario') || 
                              addressLower.includes('toronto') || 
                              addressLower.includes('on') ||
                              addressLower.includes('canada');
  
  return hasPostalCode || hasCanadianLocation;
}

/**
 * Validate currency amount
 */
export function isValidCurrency(amount) {
  if (typeof amount === 'number') {
    return amount >= 0 && isFinite(amount);
  }
  
  if (typeof amount === 'string') {
    const parsed = parseFloat(amount);
    return !isNaN(parsed) && parsed >= 0 && isFinite(parsed);
  }
  
  return false;
}

/**
 * Validate distance value
 */
export function isValidDistance(distance) {
  const parsed = parseFloat(distance);
  return !isNaN(parsed) && parsed > 0 && parsed <= 1000; // Max 1000km
}

/**
 * Validate order status
 */
export function isValidOrderStatus(status) {
  const validStatuses = ['yet_to_pickup', 'in_progress', 'delivered'];
  return validStatuses.includes(status);
}

/**
 * Validate user role
 */
export function isValidUserRole(role) {
  const validRoles = ['pharmacy', 'driver', 'admin'];
  return validRoles.includes(role);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitize string for filename
 */
export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Validate environment variables
 */
export function validateEnvironmentVariables() {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate email configuration if provided
  if (process.env.EMAIL_USER && !isValidEmail(process.env.EMAIL_USER)) {
    throw new Error('Invalid EMAIL_USER format');
  }
  
  // Validate Supabase URL format
  if (!process.env.SUPABASE_URL.includes('supabase.co')) {
    throw new Error('Invalid SUPABASE_URL format');
  }
  
  return true;
}
