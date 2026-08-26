import API_BASE_URL from '../config';

/**
 * Normalizes a URL returned by the API.
 * If the URL is hardcoded to localhost (common in misconfigured backends),
 * it replaces it with the actual API base domain.
 * If it's a relative path, it prepends the API base domain.
 */
export const getMediaUrl = (url) => {
    if (!url) return null;

    // If it's already a full URL and NOT localhost, return as is
    if (url.startsWith('http') && !url.includes('localhost')) {
        return url;
    }

    // Get the base domain from API_BASE_URL (removes /api if present)
    const baseDomain = API_BASE_URL.replace(/\/api$/, '');

    // If it's a localhost URL, extract only the path
    if (url.includes('localhost')) {
        try {
            const urlObj = new URL(url);
            return `${baseDomain}${urlObj.pathname}`;
        } catch (e) {
            // Fallback if URL parsing fails
            return url.replace(/http:\/\/localhost:\d+/, baseDomain);
        }
    }

    // If it's a relative path, prepend baseDomain
    if (url.startsWith('/')) {
        return `${baseDomain}${url}`;
    }

    return url;
};
