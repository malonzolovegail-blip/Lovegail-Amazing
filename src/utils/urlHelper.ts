/**
 * URL and Deep-Linking Utilities for Gem Store Local
 * Ensures all customer, merchant, and staff links are 100% useful, testable,
 * shareable across devices, and synchronized with browser history.
 */

// Shared public Cloud Run URL for external phone scanning & sharing
export const DEFAULT_SHARED_APP_URL = 'https://ais-pre-de5kgqtbxmhoutat2lrp7y-594553953061.asia-east1.run.app';

const STORAGE_KEY_CUSTOM_BASE = 'gemstore_custom_base_url';

/**
 * Returns the best base URL for sharing with outside devices/phones.
 * If user customized it, returns that.
 * Otherwise, if current host is localhost or internal dev, defaults to the public shared app URL.
 */
export function getShareableBaseUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_SHARED_APP_URL;

  const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_BASE);
  if (stored && stored.trim().length > 0) {
    return stored.trim().replace(/\/+$/, '');
  }

  const origin = window.location.origin;
  // If running in localhost or container preview, provide the public shared URL for external devices
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return DEFAULT_SHARED_APP_URL;
  }

  return `${origin}${window.location.pathname}`.replace(/\/+$/, '');
}

/**
 * Returns the immediate in-app browser URL
 */
export function getLocalPreviewBaseUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_SHARED_APP_URL;
  return `${window.location.origin}${window.location.pathname}`.replace(/\/+$/, '');
}

export function setCustomShareableBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_BASE, url.trim().replace(/\/+$/, ''));
    } else {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_BASE);
    }
  }
}

export function buildCustomerMarketplaceUrl(base = getShareableBaseUrl()): string {
  return `${base}?view=customer`;
}

export function buildCustomerStoreUrl(storeId: string, base = getShareableBaseUrl()): string {
  return `${base}?view=customer&store=${encodeURIComponent(storeId)}`;
}

export function buildMerchantLoginUrl(storeId: string, base = getShareableBaseUrl()): string {
  return `${base}?view=merchant_login&store=${encodeURIComponent(storeId)}`;
}

export function buildStaffClockInUrl(storeId: string, base = getShareableBaseUrl()): string {
  return `${base}?view=staff_clockin&store=${encodeURIComponent(storeId)}`;
}

export function buildRiderPortalUrl(base = getShareableBaseUrl()): string {
  return `${base}?view=rider`;
}

export function buildAdminPortalUrl(base = getShareableBaseUrl()): string {
  return `${base}?view=admin`;
}

/**
 * Updates browser address bar seamlessly without refreshing the page
 */
export function syncAddressBar(params: { view?: string; store?: string }): void {
  if (typeof window === 'undefined') return;

  const currentUrl = new URL(window.location.href);
  const searchParams = new URLSearchParams(currentUrl.search);

  if (params.view) {
    searchParams.set('view', params.view);
  } else {
    searchParams.delete('view');
  }

  if (params.store) {
    searchParams.set('store', params.store);
  } else {
    searchParams.delete('store');
  }

  // Remove legacy 'mode' param to keep clean
  searchParams.delete('mode');

  const newSearch = searchParams.toString();
  const newRelativePathQuery = currentUrl.pathname + (newSearch ? `?${newSearch}` : '');

  window.history.replaceState({ path: newRelativePathQuery }, '', newRelativePathQuery);
}
