export const CONFIG = {
  USER_INFO_TTL: 7 * 24 * 60,
  TOKEN_KEY: 'u_token',
  USER_INFO_KEY: 'user_info',
  SESSION_ID_KEY: 'fs_session_id',
  CHAT: {
    CHAT_HISTORY_SESSION_STORAGE_KEY: 'chat_history',
    CHAT_SESSION_LOCAL_STORAGE_KEY: 'chat_session',
    TEN_MIN_EXPIRY_TIME: 10 * 60 * 1000, // 10 minutes
    EXPIRY_TIME_BASE: 60 * 1000, // 1 minute in milliseconds
    SESSION_TTL_MINUTES: 10, // 会话过期时间（分钟）
    // 会话检查间隔常量
    SESSION_CHECK: {
      SHORT_INTERVAL: 5 * 1000, // 5秒 - 用于即将过期的会话
      MEDIUM_INTERVAL: 15 * 1000, // 15秒 - 用于5分钟内过期的会话
      LONG_INTERVAL: 60 * 1000, // 1分钟 - 用于长期有效的会话
      DEFAULT_INTERVAL: 30 * 1000, // 30秒 - 默认检查间隔
      MINIMAL_INTERVAL: 600 * 1000, // 10分钟 - 无会话/历史记录时的最小检查
      USER_ACTIVITY_THROTTLE: 5 * 1000, // 5秒 - 用户活动检查节流（原为30秒）
    },
    // 临界值常量
    THRESHOLDS: {
      NEARLY_EXPIRED: 60 * 1000, // 1分钟内视为即将过期
      EXPIRING_SOON: 5 * 60 * 1000, // 5分钟内视为即将过期
      PRE_REFRESH_THRESHOLD: 30 * 1000, // 30秒阈值 - 提前更新会话
    },
  },
  YEARS: {
    START: 1970,
    END: new Date().getFullYear(),
  },
  PRICE: {
    MIN: 0,
    MAX: 101000,
    STEP: 1000,
    CAP: 100000,
  },
  MESSAGE_LIMIT: 3,
} as const;

export const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;