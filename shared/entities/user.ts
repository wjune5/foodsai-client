export interface GuestUser {
    id: string;
    username?: string;
    nickname?: string;
    email?: string;
    avatar?: string;
    sex?: string;
    status?: string;
    createdBy?: string | null;
    createTime?: Date;
    updatedBy?: string | null;
    updateTime?: Date;
    remark?: string | null;
}
export interface UserInfo {
    id?: number | string;
    username?: string;
    nickname?: string;
    email?: string;
    avatar?: string;
    phone?: string;
    sex?: string;
    status?: string;
    loginIp?: string;
    loginDate?: string;
    createdBy?: string | null;
    createTime?: Date;
    updatedBy?: string | null;
    updateTime?: Date;
    remark?: string | null;
}
export interface UserSettings {
    id: string;
    storageType: 'local' | 'cloud';
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
    theme: 'light' | 'dark' | 'auto';
    language: string;
    createTime: Date;
    updateTime: Date;
}

export const DEFAULT_SETTINGS: UserSettings = {
    id: 'default',
    storageType: 'local',
    autoBackup: false,
    backupFrequency: 'never',
    theme: 'auto',
    language: 'en',
    createTime: new Date(),
    updateTime: new Date()
}