import { STORAGE_KEYS } from './constants.js';

export class SuperAdminBroadcast {
    constructor() {
        this.broadcasts = [];
        this.loadBroadcasts();
    }

    loadBroadcasts() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.GLOBAL_BROADCAST);
            if (saved) {
                this.broadcasts = JSON.parse(saved);
            } else {
                this.broadcasts = [
                    {
                        id: 'BC-001',
                        title: '四層級架構全新升級通知',
                        content: '全系統已啟用獨立最高管理端、學校管理端、教師端與家長端四層架構，各校行政抽查與晨間出缺席大看板已全面連線。',
                        level: 'info',
                        sender: '最高系統管理員 (ianw.solar@gmail.com)',
                        createdAt: '2026-10-09 08:00',
                        active: true
                    }
                ];
                this.saveBroadcasts();
            }
        } catch (e) {
            console.error('Failed to load broadcasts:', e);
        }
    }

    saveBroadcasts() {
        localStorage.setItem(STORAGE_KEYS.GLOBAL_BROADCAST, JSON.stringify(this.broadcasts));
    }

    getBroadcasts() {
        return this.broadcasts;
    }

    addBroadcast(data) {
        const newBC = {
            id: 'BC-' + Date.now().toString().slice(-4),
            title: data.title || '系統公告',
            content: data.content || '',
            level: data.level || 'info', // info, warning, emergency
            sender: '最高系統管理員 (ianw.solar@gmail.com)',
            createdAt: new Date().toLocaleString('zh-TW', { hour12: false }),
            active: true
        };
        this.broadcasts.unshift(newBC);
        this.saveBroadcasts();
        return newBC;
    }

    deleteBroadcast(id) {
        this.broadcasts = this.broadcasts.filter(b => b.id !== id);
        this.saveBroadcasts();
    }
}
