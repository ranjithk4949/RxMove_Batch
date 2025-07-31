/**
 * Format currency in Canadian dollars
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD'
  }).format(parseFloat(amount) || 0);
}

/**
 * Format distance in kilometers
 */
export function formatDistance(distance) {
  const km = parseFloat(distance) || 0;
  return `${km.toFixed(1)} km`;
}

/**
 * Format percentage
 */
export function formatPercentage(value, total) {
  if (total === 0) return '0%';
  const percentage = (parseFloat(value) / parseFloat(total)) * 100;
  return `${Math.round(percentage)}%`;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for North American numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Format as +X (XXX) XXX-XXXX for international numbers
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  // Return original if format doesn't match
  return phone;
}

/**
 * Format address for display
 */
export function formatAddress(address) {
  if (!address) return '';
  
  // Capitalize first letter of each word
  return address
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format order status for display
 */
export function formatOrderStatus(status) {
  switch (status) {
    case 'yet_to_pickup':
      return 'Yet to Pickup';
    case 'in_progress':
      return 'In Progress';
    case 'delivered':
      return 'Delivered';
    default:
      return status;
  }
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format duration in milliseconds to human readable format
 */
export function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
