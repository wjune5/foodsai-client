export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const API_ENDPOINTS = {
  INVENTORY: `${API_BASE_URL}/inventory`,
  // authentication apis
  AUTH: `${API_BASE_URL}/auth`,
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/auth/register`,
  AUTH_REFRESH: `${API_BASE_URL}/auth/refresh`,
  AUTH_LOGOUT: `${API_BASE_URL}/auth/logout`,
  AUTH_ME: `${API_BASE_URL}/auth/me`,
  AUTH_EMAIL_REQUEST_CODE: `${API_BASE_URL}/auth/email/code`,

  USER_PROFILE: `${API_BASE_URL}/user/profile`,


  USER: `${API_BASE_URL}/user`,
  RECIPE: `${API_BASE_URL}/recipe`,
  FOOD: `${API_BASE_URL}/food`,
  STATISTICS: `${API_BASE_URL}/statistics`,
  RECIPE_SUGGESTIONS: `${API_BASE_URL}/recipe-suggestions`,
  RECIPE_CHECK_INGREDIENTS: `${API_BASE_URL}/recipe-check-ingredients`,
  RECIPE_CREATE: `${API_BASE_URL}/recipe-create`,
  RECIPE_UPDATE: `${API_BASE_URL}/recipe-update`,
  RECIPE_DELETE: `${API_BASE_URL}/recipe-delete`,
  RECIPE_GET: `${API_BASE_URL}/recipe-get`,
  RECIPE_LIST: `${API_BASE_URL}/recipe-list`,
  
  // File upload
  UPLOAD: '/api/upload',
};
