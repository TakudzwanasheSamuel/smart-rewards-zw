/**
 * Currency and points conversion utilities
 */

// Point value configuration
export const POINT_CONFIG = {
  VALUE_PER_POINT: 0.01, // 1 point = 1 cent (USD 0.01)
  CURRENCY_SYMBOL: '$',
  CURRENCY_CODE: 'USD',
} as const;

/**
 * Convert points to currency value
 */
export function pointsToCurrency(points: number): number {
  return points * POINT_CONFIG.VALUE_PER_POINT;
}

/**
 * Convert currency to points
 */
export function currencyToPoints(amount: number): number {
  return Math.floor(amount / POINT_CONFIG.VALUE_PER_POINT);
}

/**
 * Format points as currency string
 */
export function formatPointsAsCurrency(points: number): string {
  const value = pointsToCurrency(points);
  return `${POINT_CONFIG.CURRENCY_SYMBOL}${value.toFixed(2)}`;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return `${POINT_CONFIG.CURRENCY_SYMBOL}${amount.toFixed(2)}`;
}

/**
 * Get display text for points with currency equivalent
 */
export function getPointsDisplayText(points: number, showBoth: boolean = true): string {
  if (!showBoth) {
    return `${points} point${points !== 1 ? 's' : ''}`;
  }
  
  const currencyValue = formatPointsAsCurrency(points);
  return `${points} point${points !== 1 ? 's' : ''} (${currencyValue})`;
}

/**
 * Get the currency value of points earned from an activity
 */
export function getActivityValue(activity: string): { points: number; currency: string } {
  const activityValues = {
    signup: 200,         // $2.00 (200 points)
    follow_business: 100, // $1.00 (100 points)
    join_mukando: 100,   // $1.00 (100 points)
    first_purchase: 500, // $5.00 (500 points)
    referral: 300,       // $3.00 (300 points)
  };
  
  const points = activityValues[activity as keyof typeof activityValues] || 0;
  return {
    points,
    currency: formatPointsAsCurrency(points)
  };
}
