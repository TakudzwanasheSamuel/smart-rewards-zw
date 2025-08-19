// API utility functions for making authenticated requests

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, headers = {} } = options;
  
  console.log(`🌐 API Call: ${method} ${endpoint}`);
  
  // Get token from localStorage
  const token = localStorage.getItem('smart_rewards_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log(`🔑 Token attached: ${token.substring(0, 20)}...`);
  } else {
    console.log('⚠️ No token found in localStorage');
  }

  if (body && method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
    console.log('📤 Request body:', body);
  }

  console.log('📋 Request config:', {
    method,
    headers: Object.keys(headers),
    hasBody: !!config.body
  });

  const response = await fetch(endpoint, config);
  
  console.log(`📥 Response: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ API Error Response:', errorData);
    
    // Handle stale token errors by clearing localStorage and redirecting to login
    if (errorData.code === 'STALE_TOKEN' || response.status === 401) {
      console.log('🔄 Stale token detected, clearing localStorage and redirecting to login');
      localStorage.removeItem('smart_rewards_token');
      localStorage.removeItem('smart_rewards_user');
      window.location.href = '/login';
      return;
    }
    
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const responseData = await response.json();
  console.log('✅ API Success Response:', responseData);
  return responseData;
}

// Specific API functions for common operations

export const customerApi = {
  getProfile: () => apiCall('/api/customers/me'),
  updatePreferences: (interests: string[]) => 
    apiCall('/api/customers/me/preferences', {
      method: 'PUT',
      body: { interests }
    }),
  getTransactions: () => apiCall('/api/customers/me/transactions'),
  getNotifications: () => apiCall('/api/customers/me/notifications'),
  getBusinesses: (category?: string, location?: { lat: number; lng: number }) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (location) {
      params.append('latitude', location.lat.toString());
      params.append('longitude', location.lng.toString());
    }
    return apiCall(`/api/businesses?${params.toString()}`);
  },
  getBusiness: (id: string) => apiCall(`/api/businesses/${id}`),
  followBusiness: (id: string) => 
    apiCall(`/api/businesses/${id}/follow`, { method: 'POST' }),
  unfollowBusiness: (id: string) => 
    apiCall(`/api/businesses/${id}/follow`, { method: 'DELETE' }),
  isFollowingBusiness: (id: string) => 
    apiCall(`/api/businesses/${id}/follow`, { method: 'GET' }),
  joinMukandoGroup: (groupId: string) => 
    apiCall(`/api/mukando/${groupId}/join`, { method: 'POST' }),
  redeemOffer: (offerId: string) => 
    apiCall('/api/redeem-offer', { method: 'POST', body: { offerId } }),
};

export const loyaltyApi = {
  scanQR: (qrCodeData: string, businessId: string, transactionAmount: number) =>
    apiCall('/api/loyalty/scan', {
      method: 'POST',
      body: { qrCodeData, businessId, transactionAmount }
    }),
  checkIn: (businessId: string, coordinates: { latitude: number; longitude: number }) =>
    apiCall('/api/loyalty/check-in', {
      method: 'POST',
      body: { businessId, coordinates }
    }),
};

export const adminApi = {
  getCustomers: () => apiCall('/api/admin/customers'),
  getCustomer: (id: string) => apiCall(`/api/admin/customers/${id}`),
  adjustPoints: (customerId: string, loyaltyPoints?: number, ecoPoints?: number) =>
    apiCall(`/api/admin/customers/${customerId}/points`, {
      method: 'POST',
      body: { loyalty_points: loyaltyPoints, eco_points: ecoPoints }
    }),
  verifyRedemption: (redemptionCode: string) =>
    apiCall('/api/redeem-offer', { method: 'PUT', body: { redemptionCode } }),
  getRules: () => apiCall('/api/admin/rules'),
  createRule: (ruleType: string, ruleJson: any) =>
    apiCall('/api/admin/rules', {
      method: 'POST',
      body: { rule_type: ruleType, rule_json: ruleJson }
    }),
  getOffers: () => apiCall('/api/admin/offers'),
  createOffer: (offerData: any) =>
    apiCall('/api/admin/offers', {
      method: 'POST',
      body: offerData
    }),
  getMukandoGroups: () => apiCall('/api/admin/mukando'),
  createMukandoGroup: (groupData: any) =>
    apiCall('/api/admin/mukando', {
      method: 'POST',
      body: groupData
    }),
  updateBusinessLocation: (latitude: number, longitude: number) =>
    apiCall('/api/admin/business/location', {
      method: 'PUT',
      body: { latitude, longitude }
    }),
  getBusinessProfile: () => apiCall('/api/admin/business/profile'),
  updateBusinessProfile: (profileData: {
    business_description?: string;
    contact_email?: string;
    contact_phone?: string;
    business_address?: string;
    website_url?: string;
    business_category?: string;
  }) =>
    apiCall('/api/admin/business/profile', {
      method: 'PUT',
      body: profileData
    }),
};

export const offersApi = {
  getOffers: (businessId?: string, location?: { lat: number; lng: number }) => {
    const params = new URLSearchParams();
    if (businessId) params.append('businessId', businessId);
    if (location) {
      params.append('latitude', location.lat.toString());
      params.append('longitude', location.lng.toString());
    }
    return apiCall(`/api/offers?${params.toString()}`);
  },
  getBusinessOffers: (businessId: string) => 
    apiCall(`/api/offers?businessId=${businessId}`),
};

export const mukandoApi = {
  // Customer functions
  createGroupRequest: (data: {
    businessId: string;
    goalName: string;
    goalPointsRequired: number;
    contributionInterval: string;
    termLength: number;
  }) => apiCall('/api/mukando/create-request', {
    method: 'POST',
    body: data,
  }),
  joinGroup: (mukandoGroupId: string) => apiCall('/api/mukando/join', {
    method: 'POST',
    body: { mukandoGroupId },
  }),
  contributeToGroup: (mukandoGroupId: string, pointsAmount: number) => apiCall('/api/mukando/contribute', {
    method: 'POST',
    body: { mukandoGroupId, pointsAmount },
  }),
  getMyGroups: (status?: string) => {
    let url = '/api/mukando/groups?userType=customer';
    if (status) url += `&status=${status}`;
    return apiCall(url);
  },
  getAvailableGroups: (businessId?: string) => {
    let url = '/api/mukando/available';
    if (businessId) url += `?businessId=${businessId}`;
    return apiCall(url);
  },
  
  // Business functions
  approveGroup: (mukandoGroupId: string, maxMembers: number, discountRate: number) => apiCall('/api/mukando/approve', {
    method: 'POST',
    body: { mukandoGroupId, maxMembers, discountRate },
  }),
  getBusinessGroups: (status?: string) => {
    let url = '/api/mukando/groups?userType=business';
    if (status) url += `&status=${status}`;
    return apiCall(url);
  },
  
  // Admin functions
  distributeRewards: () => apiCall('/api/mukando/distribute-rewards', { method: 'POST' }),
  getGroupsReadyForDistribution: () => apiCall('/api/mukando/distribute-rewards'),
};

// AI Insights API
export const aiInsightsApi = {
  getBusinessInsights: (options?: {
    type?: 'comprehensive' | 'quick' | 'specific';
    focus?: 'growth' | 'retention' | 'engagement' | 'revenue' | 'all';
    includeMetrics?: boolean;
  }) => {
    let url = '/api/admin/ai-insights';
    const params = new URLSearchParams();
    
    if (options?.type) params.append('type', options.type);
    if (options?.focus) params.append('focus', options.focus);
    if (options?.includeMetrics) params.append('includeMetrics', 'true');
    
    if (params.toString()) url += `?${params.toString()}`;
    
    return apiCall(url);
  },
  
  implementRecommendation: (recommendationId: string, feedback?: string) => apiCall('/api/admin/ai-insights', {
    method: 'POST',
    body: JSON.stringify({
      action: 'implement_recommendation',
      recommendationId,
      feedback
    })
  }),
  
  provideFeedback: (feedback: string) => apiCall('/api/admin/ai-insights', {
    method: 'POST',
    body: JSON.stringify({
      action: 'provide_feedback',
      feedback
    })
  })
};

// Customer Advisor API
export const customerAdvisorApi = {
  chat: (message: string, options?: {
    conversationContext?: Array<{ role: 'user' | 'assistant'; content: string }>;
    requestType?: 'general' | 'offers' | 'businesses' | 'mukando' | 'financial' | 'tier';
  }) => apiCall('/api/customer/advisor', {
    method: 'POST',
    body: {
      message,
      conversationContext: options?.conversationContext || [],
      requestType: options?.requestType || 'general'
    }
  }),

  getPersonalizedData: (dataType?: 'insights' | 'offers' | 'profile' | 'spending' | 'engagement') => {
    const url = dataType ? `/api/customer/advisor?data=${dataType}` : '/api/customer/advisor';
    return apiCall(url);
  }
};

// Badge API
export const badgeApi = {
  // Get all available badges
  getAllBadges: () => apiCall('/api/badges'),
  
  // Get customer's badges
  getCustomerBadges: (customerId?: string, includeEarned = false) => {
    const params = new URLSearchParams();
    if (customerId) params.append('customerId', customerId);
    if (includeEarned) params.append('includeEarned', 'true');
    
    const url = `/api/badges${params.toString() ? `?${params.toString()}` : ''}`;
    return apiCall(url);
  },
  
  // Get current user's badges
  getMyBadges: (includeAvailable = false) => {
    const params = includeAvailable ? '?includeAvailable=true' : '';
    return apiCall(`/api/customers/me/badges${params}`);
  },
  
  // Check for new badges
  checkForNewBadges: () => apiCall('/api/customers/me/badges/check', { method: 'POST' }),
  
  // Initialize badge system (admin only)
  initializeBadges: () => apiCall('/api/badges', {
    method: 'POST',
    body: { action: 'initialize' }
  }),
  
  // Award retroactive badges (admin only)
  awardRetroactiveBadges: () => apiCall('/api/badges', {
    method: 'POST',
    body: { action: 'retroactive' }
  })
};
