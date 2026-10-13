import { STORAGE_KEYS } from './constants.js';
import { getGlobalBroadcastsFromCloud, saveGlobalBroadcastToCloud, deleteGlobalBroadcastFromCloud } from './firebase.js';

export class SuperAdminBroadcast {
    constructor() {
        this.broadcasts = [];
        this.loadBroadcasts();
    }

    async loadBroadcasts() {
        try {
            const list = await getGlobalBroadcastsFromCloud();
            if (Array.isArray(list) && list.length > 0) {
                this.broadcasts = list;
                localStorage.setItem(STORAGE_KEYS.GLOBAL_BROADCAST, JSON.stringify(list));
                return this.broadcasts;
            }
        } catch (e) {
            console.error('Failed to load broadcasts from cloud:', e);
        }

        try {
            const saved = localStorage.getItem(STORAGE_KEYS.GLOBAL_BROADCAST);
            if (saved) {
                this.broadcasts = JSON.parse(saved);
            } else {
                this.broadcasts = [
                    {
                        id: 'BC-001',
                        title: '校園四端系統全面連線通知',
                        content: '全系統已啟用系統管理端、學校管理端、教師端與家長端四端架構，各校行政抽查、晨間出缺席大看板與校安廣播已全面即時連線。',
                        level: 'info',
                        sender: '最高系統管理員 (ianw.solar@gmail.com)',
                        createdAt: '2026-10-13 08:00',
                        active: true
                    }
                ];
                this.saveBroadcasts();
            }
        } catch (e) {
            console.error('Failed to load broadcasts:', e);
        }
        return this.broadcasts;
    }

    saveBroadcasts() {
        localStorage.setItem(STORAGE_KEYS.GLOBAL_BROADCAST, JSON.stringify(this.broadcasts));
    }

    getBroadcasts() {
        return this.broadcasts;
    }

    async addBroadcast(data) {
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
        try {
            await saveGlobalBroadcastToCloud(newBC);
        } catch (e) {
            console.warn('Sync broadcast to cloud warning:', e);
        }
        return newBC;
    }

    async deleteBroadcast(id) {
        this.broadcasts = this.broadcasts.filter(b => b.id !== id);
        this.saveBroadcasts();
        try {
            await deleteGlobalBroadcastFromCloud(id);
        } catch (e) {
            console.warn('Delete broadcast from cloud warning:', e);
        }
    }
}
