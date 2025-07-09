import { UserInfo } from "../entities/user";
import { getCookie, getCookieConsent } from "../utils/cookie";
import { getLocalStorage, setLocalStorageWithTTL } from "../utils/storage";
import { API_ENDPOINTS } from "../constants/api";
import { CONFIG } from "../constants/config";

const TOKEN_KEY = 'u_token';
const USER_INFO_KEY = 'user_info';


// Fetch user info using auth token
export const fetchUserInfo = async (): Promise<UserInfo | null> => {
    // get token from cookie first
    let token = getCookie(TOKEN_KEY);

    // if no token in cookie, get from localStorage
    if (!token) {
        token = localStorage.getItem(TOKEN_KEY);
    }
    if (!token) {
        return null;
    }
    try {
        const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status === 401 || response.status === 403) return null;
        if (!response.ok) throw new Error('Failed to fetch user info');
        const user = await response.json();

        const consent = getCookieConsent();
        if (consent === 'accepted') {
            saveUserInfo(user);
        }
        return user;
    } catch (err) {
        if (
            typeof process !== 'undefined' &&
            process.env &&
            process.env.NODE_ENV === 'development'
        ) {
            console.error('Failed to fetch user info:', err);
        }
        return null;
    }
};

export const saveUserInfo = (user: UserInfo) => {
    const { ...safeUserInfo } = user;
    setLocalStorageWithTTL(
        USER_INFO_KEY,
        JSON.stringify(safeUserInfo),
        CONFIG.USER_INFO_TTL
    );
};
// Refresh user info from API
export const refreshUserInfo = async () => {
    try {
        const user = await fetchUserInfo();
        return user;
    } catch (err) {
        console.error('Failed to refresh user info:', err);
        return null;
    }
};

export const getUserInfo = (): UserInfo | null => {
    const userInfo = getLocalStorage('user_info');
    if (!userInfo) return null;

    try {
        return JSON.parse(userInfo);
    } catch (err) {
        console.error('Failed to parse user info:', err);
        return null;
    }
};