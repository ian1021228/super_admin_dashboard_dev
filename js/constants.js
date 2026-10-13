// Constants and Config for Super Admin Dashboard
export const SUPER_ADMIN_EMAIL = 'ianw.solar@gmail.com';

// 測試版獨立 Firebase Firestore 命名空間（與正式版 100% 實體隔離）
export const globalAppId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'homework-checker-dev';

export const firebaseConfig = {
    apiKey: "AIzaSyDuBAZ5hEcrhpYt-XjhiXfi-wuow0Cq83A",
    authDomain: "cheker-barcode.firebaseapp.com",
    projectId: "cheker-barcode",
    storageBucket: "cheker-barcode.firebasestorage.app",
    messagingSenderId: "1093592859159",
    appId: "1:1093592859159:web:40c0741defbb074e4ad252"
};

export const STORAGE_KEYS = {
    AUTH_USER: 'super_admin_auth_user',
    TENANTS: 'super_admin_tenants',
    GLOBAL_BROADCAST: 'super_admin_global_broadcast',
    AUDIT_LOGS: 'super_admin_audit_logs'
};

export const DEFAULT_TENANTS = [
    {
        id: 'SCH-701',
        name: '高雄市立七賢國中',
        code: 'QXJH',
        adminAccount: 'qxjh_admin',
        adminPassword: 'qxjh@secure2026',
        maxClasses: 36,
        contactPerson: '王主任 (教務處)',
        contactEmail: 'academic@qxjh.kh.edu.tw',
        status: 'active',
        createdAt: '2026-09-01',
        expiresAt: '2027-08-31',
        totalStudents: 1080,
        todayAttendanceRate: 98.6
    },
    {
        id: 'SCH-702',
        name: '高雄市立五福國中',
        code: 'WFJH',
        adminAccount: 'wfjh_admin',
        adminPassword: 'wfjh@secure2026',
        maxClasses: 42,
        contactPerson: '陳主任 (學務處)',
        contactEmail: 'discipline@wfjh.kh.edu.tw',
        status: 'active',
        createdAt: '2026-09-01',
        expiresAt: '2027-08-31',
        totalStudents: 1320,
        todayAttendanceRate: 97.8
    },
    {
        id: 'SCH-703',
        name: '高雄市立陽明國中',
        code: 'YMแตก',
        code: 'YMJH',
        adminAccount: 'ymjh_admin',
        adminPassword: 'ymjh@secure2026',
        maxClasses: 48,
        contactPerson: '林組長 (資訊組)',
        contactEmail: 'info@ymjh.kh.edu.tw',
        status: 'active',
        createdAt: '2026-09-01',
        expiresAt: '2027-08-31',
        totalStudents: 1560,
        todayAttendanceRate: 99.1
    },
    {
        id: 'SCH-801',
        name: '高雄市立新莊高中',
        code: 'HCHS',
        adminAccount: 'hchs_admin',
        adminPassword: 'hchs@secure2026',
        maxClasses: 30,
        contactPerson: '李秘書',
        contactEmail: 'secretary@hchs.kh.edu.tw',
        status: 'active',
        createdAt: '2026-09-01',
        expiresAt: '2027-08-31',
        totalStudents: 980,
        todayAttendanceRate: 96.5
    },
    {
        id: 'SCH-901',
        name: '測試國中',
        code: 'DEMO',
        adminAccount: 'antigravity',
        adminPassword: '123456',
        maxClasses: 20,
        contactPerson: '測試系統管理員',
        contactEmail: 'antigravity@test.edu.tw',
        status: 'active',
        createdAt: '2026-09-01',
        expiresAt: '2028-12-31',
        totalStudents: 500,
        todayAttendanceRate: 99.5
    }
];
