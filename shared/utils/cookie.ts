/**
 * Get a cookie by name
 * @param {string} name Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export function getCookie(name: string): string | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

const CONSENT_KEY = 'fs_cookie_consent';

/**
* Get user's cookie consent status
* @returns {'accepted' | null}
*/
export function getCookieConsent(): 'accepted' | null {
    if (typeof localStorage === 'undefined') {
        return null;
    }
    return localStorage.getItem(CONSENT_KEY) === 'accepted'
        ? 'accepted'
        : null;
}

/**
 * Delete a cookie by name
 * @param {string} name Cookie name
 * @param {string} path Cookie path
 */
export function deleteCookie(name: string, path: string = '/'): void {
    if (typeof document === 'undefined') {
        return;
    }

    document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Lax`;
}