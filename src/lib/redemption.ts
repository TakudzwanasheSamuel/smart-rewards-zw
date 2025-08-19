/**
 * Utility functions for offer redemption
 */

// Generate QR code data for redemption
export function generateQRData(redemptionCode: string, offerId: string, businessId: string) {
  return JSON.stringify({
    type: 'redemption',
    code: redemptionCode,
    offerId,
    businessId,
    timestamp: new Date().toISOString()
  });
}

// Parse QR code data
export function parseQRData(qrData: string) {
  try {
    const data = JSON.parse(qrData);
    if (data.type === 'redemption' && data.code) {
      return {
        isValid: true,
        redemptionCode: data.code,
        offerId: data.offerId,
        businessId: data.businessId,
        timestamp: data.timestamp
      };
    }
    return { isValid: false };
  } catch (error) {
    return { isValid: false };
  }
}

// Format redemption code for display
export function formatRedemptionCode(code: string) {
  // Format as XXX-XXXXXX-XXX for better readability
  const parts = code.split('-');
  if (parts.length >= 3) {
    return `${parts[0]}-${parts[1]}-${parts[2]}`;
  }
  return code;
}

// Check if redemption code is valid format
export function isValidRedemptionCodeFormat(code: string) {
  const pattern = /^RDM-\d+-[A-Z0-9]{6}$/;
  return pattern.test(code);
}

// Generate secure redemption code
export function generateRedemptionCode(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RDM-${timestamp}-${random}`;
}

// Calculate expiry time for redemption codes (24 hours)
export function getRedemptionCodeExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}
