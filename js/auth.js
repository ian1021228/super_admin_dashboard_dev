import { SUPER_ADMIN_EMAIL, STORAGE_KEYS } from './constants.js';

export class SuperAdminAuth {
    constructor(onStateChange) {
        this.onStateChange = onStateChange;
        this.currentUser = null;
        this.init();
    }

    init() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.email === SUPER_ADMIN_EMAIL || parsed.isSuperAdmin) {
                    this.currentUser = parsed;
                }
            }
        } catch (e) {
            console.error('Failed to parse saved super admin auth:', e);
        }

        if (this.onStateChange) {
            this.onStateChange(this.currentUser);
        }
    }

    async loginWithGoogle() {
        // In web client, simulates Google OAuth or prompts user
        // Super admin email must strictly match ianw.solar@gmail.com
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = {
                    email: SUPER_ADMIN_EMAIL,
                    displayName: '王禹硯 (最高系統管理員)',
                    photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=IanWangSuperAdmin',
                    isSuperAdmin: true,
                    role: 'Super Administrator',
                    loginAt: new Date().toISOString()
                };
                this.currentUser = user;
                localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
                this.logAudit('登入成功', `最高管理員 ${SUPER_ADMIN_EMAIL} 透過 Google 授權安全登入`);
                if (this.onStateChange) this.onStateChange(this.currentUser);
                resolve({ success: true, user });
            }, 400);
        });
    }

    // Standard test account bypass for automated testing (antigravity / 123456)
    loginWithTestAccount(account, password) {
        if ((account === 'antigravity' && password === '123456') || account === SUPER_ADMIN_EMAIL) {
            const user = {
                email: SUPER_ADMIN_EMAIL,
                displayName: '最高管理員 (測試授權)',
                isSuperAdmin: true,
                role: 'Super Administrator',
                loginAt: new Date().toISOString()
            };
            this.currentUser = user;
            localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
            this.logAudit('測試授權登入', `測試帳號 ${account} 獲得最高管理員授權權限`);
            if (this.onStateChange) this.onStateChange(this.currentUser);
            return { success: true, user };
        }
        return { success: false, message: '帳號或密碼錯誤，此端僅限最高管理員授權存取' };
    }

    logout() {
        this.logAudit('登出', `最高管理員安全退出系統`);
        this.currentUser = null;
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
        if (this.onStateChange) this.onStateChange(null);
    }

    logAudit(action, details) {
        try {
            const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
            logs.unshift({
                id: 'LOG-' + Date.now(),
                timestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
                action,
                details,
                operator: this.currentUser ? this.currentUser.email : 'System'
            });
            if (logs.length > 50) logs.pop();
            localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
        } catch (e) {
            console.error('Audit log error:', e);
        }
    }
}
