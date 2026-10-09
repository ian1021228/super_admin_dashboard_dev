import { STORAGE_KEYS, DEFAULT_TENANTS } from './constants.js';

export class TenantManager {
    constructor() {
        this.tenants = [];
        this.loadTenants();
    }

    loadTenants() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.TENANTS);
            if (saved) {
                this.tenants = JSON.parse(saved);
            } else {
                this.tenants = [...DEFAULT_TENANTS];
                this.saveTenants();
            }
        } catch (e) {
            console.error('Failed to load tenants:', e);
            this.tenants = [...DEFAULT_TENANTS];
        }
    }

    saveTenants() {
        localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(this.tenants));
    }

    getTenants() {
        return this.tenants;
    }

    addTenant(schoolData) {
        const id = 'SCH-' + Math.floor(100 + Math.random() * 900);
        const newSchool = {
            id,
            name: schoolData.name || '未命名學校',
            code: schoolData.code || ('SCH' + Math.floor(10 + Math.random() * 90)),
            adminAccount: schoolData.adminAccount || (schoolData.code.toLowerCase() + '_admin'),
            adminPassword: schoolData.adminPassword || this.generateSecurePassword(),
            maxClasses: parseInt(schoolData.maxClasses) || 30,
            contactPerson: schoolData.contactPerson || '行政主任',
            contactEmail: schoolData.contactEmail || '',
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
            expiresAt: schoolData.expiresAt || '2027-08-31',
            totalStudents: parseInt(schoolData.totalStudents) || 600,
            todayAttendanceRate: 98.0
        };
        this.tenants.unshift(newSchool);
        this.saveTenants();
        return newSchool;
    }

    updateTenant(id, updateData) {
        const index = this.tenants.findIndex(t => t.id === id);
        if (index !== -1) {
            this.tenants[index] = { ...this.tenants[index], ...updateData };
            this.saveTenants();
            return this.tenants[index];
        }
        return null;
    }

    deleteTenant(id) {
        this.tenants = this.tenants.filter(t => t.id !== id);
        this.saveTenants();
    }

    generateSecurePassword(prefix = 'sch') {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let rand = '';
        for (let i = 0; i < 6; i++) {
            rand += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `${prefix}@${rand}`;
    }

    exportToCSV() {
        const headers = ['學校編號', '學校名稱', '學校代碼', '管理員帳號', '管理員密碼', '授權班級數', '聯絡人', '電子信箱', '授權到期日', '狀態'];
        const rows = this.tenants.map(t => [
            t.id,
            `"${t.name}"`,
            t.code,
            t.adminAccount,
            t.adminPassword,
            t.maxClasses,
            `"${t.contactPerson}"`,
            t.contactEmail,
            t.expiresAt,
            t.status === 'active' ? '授權啟用中' : '已凍結'
        ]);

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `全校管理帳號派發清冊_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
}
