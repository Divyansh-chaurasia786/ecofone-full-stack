const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
    ? 'https://ecofone-backend.vercel.app/api/v1' 
    : 'http://localhost:4000/api/v1');

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // Read stored client JWT token
  let token = '';
  if (typeof window !== 'undefined') {
    token = sessionStorage.getItem('ecofone_token') || localStorage.getItem('ecofone_token') || '';
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (err: any) {
    if (err.name === 'TypeError' || err.message?.includes('fetch')) {
      throw new Error(`API server connection unavailable (${BASE_URL})`);
    }
    throw err;
  }
}

export const api = {
  // Auth
  sendOtp: (phone: string) => apiRequest('auth/otp/send', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyOtp: (phone: string, code: string) => apiRequest('auth/otp/verify', { method: 'POST', body: JSON.stringify({ phone, code }) }),
  googleLogin: (idToken: string) => apiRequest('auth/google', { method: 'POST', body: JSON.stringify({ idToken }) }),
  masterAdminLogin: (password: string) => apiRequest('auth/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),

  // Ecommerce
  getCatalog: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiRequest(`ecommerce/catalog?${query}`);
  },
  getSkuDetails: (skuId: string) => apiRequest(`ecommerce/sku/${skuId}`),
  initiateCheckout: (skuId: string, storeId?: string) => apiRequest('ecommerce/checkout', { method: 'POST', body: JSON.stringify({ skuId, storeId }) }),
  verifyPayment: (payload: { orderId: string; razorpayPaymentId: string; razorpaySignature: string }) => 
    apiRequest('ecommerce/verify-payment', { method: 'POST', body: JSON.stringify(payload) }),

  // Tradein
  getQuote: (payload: any) => apiRequest('tradein/quote', { method: 'POST', body: JSON.stringify(payload) }),
  schedulePickup: (payload: any) => apiRequest('tradein/schedule', { method: 'POST', body: JSON.stringify(payload) }),
  getQuotes: () => apiRequest('tradein/quotes'),

  // Franchise
  applyFranchise: (payload: any) => apiRequest('franchise/apply', { method: 'POST', body: JSON.stringify(payload) }),
  calculateRoi: (payload: any) => apiRequest('franchise/calculate-roi', { method: 'POST', body: JSON.stringify(payload) }),
  getFranchiseApps: () => apiRequest('franchise/applications'),
  updateFranchiseAppStatus: (id: string, status: string) => 
    apiRequest(`franchise/applications/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateQuoteStatus: (id: string, status: string) => 
    apiRequest(`tradein/quotes/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // CMS
  getBlogs: () => apiRequest('cms/blogs'),
  getBlogBySlug: (slug: string) => apiRequest(`cms/blogs/${slug}`),
  getReviews: () => apiRequest('cms/reviews'),
  getReviewsAdmin: () => apiRequest('cms/reviews/admin'),
  updateReviewStatus: (id: string, status: string) => apiRequest(`cms/reviews/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  submitReview: (payload: any) => apiRequest('cms/reviews', { method: 'POST', body: JSON.stringify(payload) }),
  replyToReview: (id: string, reply: string) => apiRequest(`cms/reviews/${id}/reply`, { method: 'PATCH', body: JSON.stringify({ reply }) }),
  verifyReview: (id: string, isVerified: boolean, verifiedProduct?: string) => apiRequest(`cms/reviews/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ isVerified, verifiedProduct }) }),
  getJobs: () => apiRequest('cms/jobs'),
  locateStores: (lat?: number, lng?: number) => {
    const query = lat !== undefined && lng !== undefined ? `?lat=${lat}&lng=${lng}` : '';
    return apiRequest(`cms/stores${query}`);
  },
  addStore: (payload: any) => apiRequest('cms/stores', { method: 'POST', body: JSON.stringify(payload) }),
  deleteStore: (id: string) => apiRequest(`cms/stores/${id}`, { method: 'DELETE' }),
  updateStore: (id: string, payload: any) => apiRequest(`cms/stores/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  aiChat: (message: string, history: any[]) => apiRequest('cms/ai/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),
  resolveMapsUrl: (url: string) => apiRequest(`cms/resolve-maps?url=${encodeURIComponent(url)}`),
  geocodeAddress: (address: string) => apiRequest(`cms/geocode?address=${encodeURIComponent(address)}`),
  getTeamMembers: () => apiRequest('cms/team'),
  addTeamMember: (payload: any) => apiRequest('cms/team', { method: 'POST', body: JSON.stringify(payload) }),
  updateTeamMember: (id: string, payload: any) => apiRequest(`cms/team/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteTeamMember: (id: string) => apiRequest(`cms/team/${id}`, { method: 'DELETE' }),
  reorderTeamMembers: (ids: string[]) => apiRequest('cms/team-reorder', { method: 'PATCH', body: JSON.stringify({ ids }) }),

  // Sub-Admin management
  subAdminLogin: (password: string) => apiRequest('sub-admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  listSubAdmins: () => apiRequest('sub-admin'),
  createSubAdmin: (payload: { username: string; password: string; permissions: string[] }) =>
    apiRequest('sub-admin', { method: 'POST', body: JSON.stringify(payload) }),
  deleteSubAdmin: (id: string) => apiRequest(`sub-admin/${id}`, { method: 'DELETE' }),
  resetSubAdminPassword: (id: string, password: string) =>
    apiRequest(`sub-admin/${id}/password`, { method: 'PATCH', body: JSON.stringify({ password }) }),
  updateSubAdminPermissions: (id: string, permissions: string[]) =>
    apiRequest(`sub-admin/${id}/permissions`, { method: 'PATCH', body: JSON.stringify({ permissions }) }),
  verifySubAdminPassword: (id: string, password: string) =>
    apiRequest(`sub-admin/${id}/verify-password`, { method: 'POST', body: JSON.stringify({ password }) }),

  // System Logs
  getSystemLogs: () => apiRequest('system-log'),
  createSystemLog: (action: string) => apiRequest('system-log', { method: 'POST', body: JSON.stringify({ action }) }),
  clearSystemLogs: (filterType: string) => apiRequest(`system-log?filterType=${filterType}`, { method: 'DELETE' }),

  // Enquiries deletion
  clearEnquiries: (targetType: string, filterType: string, startDate?: string, endDate?: string) => {
    let url = `franchise/applications?targetType=${targetType}&filterType=${filterType}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    return apiRequest(url, { method: 'DELETE' });
  },
};
