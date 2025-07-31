import { supabase } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * Get all pharmacies that had orders in the specified date range
 */
export async function getPharmaciesWithOrders(startDate, endDate) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        business_name,
        phone,
        address,
        orders!inner(id)
      `)
      .eq('role', 'pharmacy')
      .eq('is_active', true)
      .gte('orders.created_at', startDate.toISOString())
      .lt('orders.created_at', endDate.toISOString());
    
    if (error) {
      throw error;
    }
    
    // Remove the orders from the result (we just used it for filtering)
    return data.map(pharmacy => ({
      id: pharmacy.id,
      email: pharmacy.email,
      name: pharmacy.name,
      business_name: pharmacy.business_name,
      phone: pharmacy.phone,
      address: pharmacy.address
    }));
    
  } catch (error) {
    logger.error('Error fetching pharmacies with orders:', error);
    throw error;
  }
}

/**
 * Get all active pharmacies (for monthly reports)
 */
export async function getAllActivePharmacies() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, business_name, phone, address')
      .eq('role', 'pharmacy')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      throw error;
    }
    
    return data;
    
  } catch (error) {
    logger.error('Error fetching active pharmacies:', error);
    throw error;
  }
}

/**
 * Get daily orders for a specific pharmacy
 */
export async function getPharmacyDailyOrders(pharmacyId, startDate, endDate) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('pharmacy_id', pharmacyId)
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data || [];
    
  } catch (error) {
    logger.error(`Error fetching daily orders for pharmacy ${pharmacyId}:`, error);
    throw error;
  }
}

/**
 * Get monthly orders for a specific pharmacy
 */
export async function getPharmacyMonthlyOrders(pharmacyId, startDate, endDate) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('pharmacy_id', pharmacyId)
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data || [];
    
  } catch (error) {
    logger.error(`Error fetching monthly orders for pharmacy ${pharmacyId}:`, error);
    throw error;
  }
}

/**
 * Get pharmacy details by ID
 */
export async function getPharmacyById(pharmacyId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', pharmacyId)
      .eq('role', 'pharmacy')
      .eq('is_active', true)
      .maybeSingle();
    
    if (error) {
      throw error;
    }
    
    return data;
    
  } catch (error) {
    logger.error(`Error fetching pharmacy ${pharmacyId}:`, error);
    throw error;
  }
}

/**
 * Get order statistics for a date range
 */
export async function getOrderStatistics(startDate, endDate) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status, fare, amt_need_to_collect, amt_collected')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());
    
    if (error) {
      throw error;
    }
    
    const stats = {
      totalOrders: data.length,
      deliveredOrders: data.filter(o => o.status === 'delivered').length,
      totalRevenue: data.reduce((sum, order) => sum + parseFloat(order.fare || 0), 0),
      totalToCollect: data.reduce((sum, order) => sum + parseFloat(order.amt_need_to_collect || 0), 0),
      totalCollected: data.reduce((sum, order) => sum + parseFloat(order.amt_collected || 0), 0)
    };
    
    return stats;
    
  } catch (error) {
    logger.error('Error fetching order statistics:', error);
    throw error;
  }
}
