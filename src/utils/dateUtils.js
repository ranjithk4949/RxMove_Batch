/**
 * Get yesterday's date range in Toronto timezone
 */
export function getYesterdayDateRange() {
  const now = new Date();
  
  // Get yesterday in Toronto timezone
  const yesterday = new Date(now.toLocaleString("en-US", { timeZone: "America/Toronto" }));
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Start of yesterday (00:00:00)
  const startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  
  // End of yesterday (23:59:59.999)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);
  
  // Format date string for display
  const dateString = yesterday.toLocaleDateString('en-US', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return {
    startDate,
    endDate,
    dateString
  };
}

/**
 * Get last month's date range in Toronto timezone
 */
export function getLastMonthDateRange() {
  const now = new Date();
  
  // Get current date in Toronto timezone
  const torontoNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Toronto" }));
  
  // Get first day of current month
  const firstDayCurrentMonth = new Date(torontoNow.getFullYear(), torontoNow.getMonth(), 1);
  
  // Get first day of last month
  const firstDayLastMonth = new Date(firstDayCurrentMonth);
  firstDayLastMonth.setMonth(firstDayLastMonth.getMonth() - 1);
  
  // Get first day of current month (end of last month)
  const endDate = new Date(firstDayCurrentMonth);
  
  const year = firstDayLastMonth.getFullYear();
  const month = firstDayLastMonth.getMonth() + 1; // JavaScript months are 0-indexed
  
  const monthString = firstDayLastMonth.toLocaleDateString('en-US', {
    timeZone: 'America/Toronto',
    month: 'long'
  });
  
  return {
    startDate: firstDayLastMonth,
    endDate,
    monthString,
    year,
    month
  };
}

/**
 * Get current date in Toronto timezone
 */
export function getCurrentTorontoDate() {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "America/Toronto" }));
}

/**
 * Convert UTC date to Toronto timezone
 */
export function utcToToronto(utcDate) {
  return new Date(utcDate.toLocaleString("en-US", { timeZone: "America/Toronto" }));
}

/**
 * Get date range for a specific number of days ago
 */
export function getDateRangeForDaysAgo(daysAgo) {
  const now = getCurrentTorontoDate();
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() - daysAgo);
  
  // Start of target date
  const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  
  // End of target date
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);
  
  const dateString = targetDate.toLocaleDateString('en-US', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return {
    startDate,
    endDate,
    dateString
  };
}

/**
 * Get month range for a specific number of months ago
 */
export function getMonthRangeForMonthsAgo(monthsAgo) {
  const now = getCurrentTorontoDate();
  
  // Get first day of target month
  const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  
  // Get first day of next month (end of target month)
  const endDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 1);
  
  const year = targetMonth.getFullYear();
  const month = targetMonth.getMonth() + 1;
  
  const monthString = targetMonth.toLocaleDateString('en-US', {
    timeZone: 'America/Toronto',
    month: 'long'
  });
  
  return {
    startDate: targetMonth,
    endDate,
    monthString,
    year,
    month
  };
}
