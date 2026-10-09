import { SuperAdminAuth } from './auth.js';
import { TenantManager } from './tenants.js';
import { SuperAdminInspection } from './inspection.js';
import { SuperAdminBroadcast } from './broadcast.js';
import { STORAGE_KEYS } from './constants.js';

class SuperAdminApp {
    constructor() {
        this.currentTab = 'tenants';
        this.tenantManager = new TenantManager();
        this.inspection = new SuperAdminInspection(this.tenantManager);
        this.broadcast = new SuperAdminBroadcast();

        this.auth = new SuperAdminAuth((user) => this.handleAuthState(user));
        this.bindEvents();
    }

    handleAuthState(user) {
        const loginView = document.getElementById('login-view');
        const mainView = document.getElementById('main-dashboard-view');
        const userBadge = document.getElementById('super-admin-user-badge');

        if (user) {
            loginView.classList.add('hidden');
            mainView.classList.remove('hidden');
            userBadge.textContent = user.displayName || user.email;
            this.renderKPIs();
            this.switchTab(this.currentTab);
        } else {
            loginView.classList.remove('hidden');
            mainView.classList.add('hidden');
        }
    }

    renderKPIs() {
        const tenants = this.tenantManager.getTenants();
        const totalSchools = tenants.length;
        const totalStudents = tenants.reduce((acc, t) => acc + (t.totalStudents || 0), 0);
        const avgAttendance = tenants.length ? (tenants.reduce((acc, t) => acc + (t.todayAttendanceRate || 98), 0) / tenants.length).toFixed(1) : '98.5';

        document.getElementById('kpi-total-schools').textContent = totalSchools;
        document.getElementById('kpi-total-students').textContent = totalStudents.toLocaleString();
        document.getElementById('kpi-avg-attendance').textContent = avgAttendance + '%';
        document.getElementById('kpi-active-tenants').textContent = tenants.filter(t => t.status === 'active').length;
    }

    switchTab(tabId) {
        this.currentTab = tabId;
        const navBtns = document.querySelectorAll('.tab-nav-btn');
        navBtns.forEach(btn => {
            if (btn.dataset.tab === tabId) {
                btn.className = 'tab-nav-btn active flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 no-wrap transition-all';
            } else {
                btn.className = 'tab-nav-btn flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 no-wrap transition-all';
            }
        });

        // Hide all tab panels
        document.querySelectorAll('.tab-content-panel').forEach(p => p.classList.add('hidden'));

        // Show target tab panel
        const target = document.getElementById(`panel-${tabId}`);
        if (target) {
            target.classList.remove('hidden');
        }

        if (tabId === 'tenants') {
            this.renderTenantsTable();
        } else if (tabId === 'inspection') {
            this.inspection.renderInspectionView('inspection-content-container');
        } else if (tabId === 'broadcast') {
            this.renderBroadcastList();
        } else if (tabId === 'audit') {
            this.renderAuditLogs();
        }
    }

    renderTenantsTable() {
        const tbody = document.getElementById('tenants-table-body');
        if (!tbody) return;

        const tenants = this.tenantManager.getTenants();
        tbody.innerHTML = '';

        tenants.forEach(school => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-800/40 transition-colors border-b border-slate-800/60';
            tr.innerHTML = `
                <td class="px-4 py-3 font-mono text-xs text-indigo-400 font-bold no-wrap">${school.id}</td>
                <td class="px-4 py-3 font-bold text-white no-wrap">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-school text-slate-400 text-xs"></i>
                        <span>${school.name}</span>
                    </div>
                </td>
                <td class="px-4 py-3 font-mono text-xs text-slate-300 font-semibold no-wrap">${school.code}</td>
                <td class="px-4 py-3 font-mono text-xs text-amber-300 bg-amber-500/5 px-2.5 py-1 rounded-lg border border-amber-500/20 font-bold no-wrap">${school.adminAccount}</td>
                <td class="px-4 py-3 font-mono text-xs text-slate-300 no-wrap">
                    <span class="bg-slate-800 px-2 py-1 rounded border border-slate-700">${school.adminPassword}</span>
                </td>
                <td class="px-4 py-3 text-xs text-slate-300 font-bold no-wrap">${school.maxClasses} 班</td>
                <td class="px-4 py-3 text-xs text-slate-400 no-wrap">${school.contactPerson}</td>
                <td class="px-4 py-3 no-wrap">
                    <span class="px-2 py-0.5 rounded text-[11px] font-bold border ${school.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}">
                        ${school.status === 'active' ? '正常' : '已凍結'}
                    </span>
                </td>
                <td class="px-4 py-3 no-wrap">
                    <div class="flex items-center gap-1.5">
                        <button class="btn-copy-account px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 transition-all flex items-center gap-1 no-wrap" data-account="${school.adminAccount}" data-pass="${school.adminPassword}" title="複製學校管理帳密">
                            <i class="fa-solid fa-copy text-indigo-400"></i> 複製帳密
                        </button>
                        <a href="https://ian1021228.github.io/school_admin_dashboard_dev/" target="_blank" class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1 no-wrap" title="穿透進入學校管理中心">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> 巡查
                        </a>
                        <button class="btn-delete-tenant px-2 py-1 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs transition-all" data-id="${school.id}" title="刪除學校授權">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Bind copy buttons
        tbody.querySelectorAll('.btn-copy-account').forEach(btn => {
            btn.onclick = () => {
                const text = `【學校管理帳號通知】\n學校管理員帳號：${btn.dataset.account}\n預設管理密碼：${btn.dataset.pass}\n學校管理端入口：https://ian1021228.github.io/school_admin_dashboard_dev/`;
                navigator.clipboard.writeText(text);
                alert('已複製學校管理端登入憑證！');
            };
        });

        // Bind delete buttons
        tbody.querySelectorAll('.btn-delete-tenant').forEach(btn => {
            btn.onclick = () => {
                if (confirm('確定要移除此學校授權？此操作將凍結該校管理權限。')) {
                    this.tenantManager.deleteTenant(btn.dataset.id);
                    this.renderTenantsTable();
                    this.renderKPIs();
                }
            };
        });
    }

    renderBroadcastList() {
        const container = document.getElementById('broadcast-list-container');
        if (!container) return;

        const broadcasts = this.broadcast.getBroadcasts();
        container.innerHTML = '';

        if (broadcasts.length === 0) {
            container.innerHTML = `<div class="p-8 text-center text-slate-500 text-sm">目前尚無全系統廣播</div>`;
            return;
        }

        broadcasts.forEach(bc => {
            const card = document.createElement('div');
            card.className = 'glass-card rounded-2xl p-4 sm:p-5 border border-slate-700/60 space-y-2';
            card.innerHTML = `
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded text-[11px] font-bold border bg-indigo-500/10 text-indigo-400 border-indigo-500/30 no-wrap">
                            ${bc.level === 'emergency' ? '緊急通報' : '全域公告'}
                        </span>
                        <h4 class="font-bold text-white text-base no-wrap">${bc.title}</h4>
                    </div>
                    <span class="text-xs text-slate-400 font-mono no-wrap">${bc.createdAt}</span>
                </div>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">${bc.content}</p>
                <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span><i class="fa-solid fa-user-shield text-slate-500 mr-1"></i> ${bc.sender}</span>
                    <button class="btn-del-broadcast text-rose-400 hover:text-rose-300 p-1" data-id="${bc.id}" title="撤銷公告">
                        <i class="fa-solid fa-trash-can"></i> 撤銷
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        container.querySelectorAll('.btn-del-broadcast').forEach(btn => {
            btn.onclick = () => {
                if (confirm('確定要撤銷此公告？')) {
                    this.broadcast.deleteBroadcast(btn.dataset.id);
                    this.renderBroadcastList();
                }
            };
        });
    }

    renderAuditLogs() {
        const tbody = document.getElementById('audit-table-body');
        if (!tbody) return;

        let logs = [];
        try {
            logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
        } catch (e) {
            logs = [];
        }

        tbody.innerHTML = '';
        if (logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-slate-500 text-xs">尚無安全稽核紀錄</td></tr>`;
            return;
        }

        logs.forEach(log => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-800/60 hover:bg-slate-800/20 text-xs text-slate-300';
            tr.innerHTML = `
                <td class="px-4 py-3 font-mono text-slate-400 no-wrap">${log.timestamp}</td>
                <td class="px-4 py-3 font-bold text-indigo-300 no-wrap">${log.action}</td>
                <td class="px-4 py-3 text-slate-300">${log.details}</td>
                <td class="px-4 py-3 font-mono text-slate-400 no-wrap">${log.operator}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    bindEvents() {
        // Tab click
        document.querySelectorAll('.tab-nav-btn').forEach(btn => {
            btn.onclick = () => this.switchTab(btn.dataset.tab);
        });

        // Google Login button
        const googleLoginBtn = document.getElementById('btn-google-login');
        if (googleLoginBtn) {
            googleLoginBtn.onclick = async () => {
                await this.auth.loginWithGoogle();
            };
        }

        // Test credentials login form
        const testLoginForm = document.getElementById('test-login-form');
        if (testLoginForm) {
            testLoginForm.onsubmit = (e) => {
                e.preventDefault();
                const acc = document.getElementById('test-account-input').value.trim();
                const pwd = document.getElementById('test-password-input').value.trim();
                const res = this.auth.loginWithTestAccount(acc, pwd);
                if (!res.success) {
                    alert(res.message);
                }
            };
        }

        // Logout button
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.onclick = () => {
                if (confirm('確定要登出最高管理端？')) {
                    this.auth.logout();
                }
            };
        }

        // Add tenant modal triggers
        const addTenantBtn = document.getElementById('btn-open-add-tenant');
        const modal = document.getElementById('modal-add-tenant');
        const closeModalBtn = document.getElementById('btn-close-tenant-modal');
        const form = document.getElementById('form-add-tenant');

        if (addTenantBtn && modal) {
            addTenantBtn.onclick = () => {
                modal.classList.remove('hidden');
                document.getElementById('tenant-password').value = this.tenantManager.generateSecurePassword();
            };
        }
        if (closeModalBtn && modal) {
            closeModalBtn.onclick = () => modal.classList.add('hidden');
        }

        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const name = document.getElementById('tenant-name').value.trim();
                const code = document.getElementById('tenant-code').value.trim();
                const account = document.getElementById('tenant-account').value.trim();
                const password = document.getElementById('tenant-password').value.trim();
                const maxClasses = document.getElementById('tenant-classes').value;
                const contact = document.getElementById('tenant-contact').value.trim();

                this.tenantManager.addTenant({
                    name,
                    code,
                    adminAccount: account,
                    adminPassword: password,
                    maxClasses,
                    contactPerson: contact
                });

                this.auth.logAudit('新增學校授權', `建立學校【${name}】管理帳號 ${account}`);
                modal.classList.add('hidden');
                form.reset();
                this.renderTenantsTable();
                this.renderKPIs();
                alert(`學校【${name}】授權已建立！管理帳號：${account}`);
            };
        }

        // Export CSV button
        const exportBtn = document.getElementById('btn-export-csv');
        if (exportBtn) {
            exportBtn.onclick = () => this.tenantManager.exportToCSV();
        }

        // Add Broadcast Form
        const bcForm = document.getElementById('form-add-broadcast');
        if (bcForm) {
            bcForm.onsubmit = (e) => {
                e.preventDefault();
                const title = document.getElementById('bc-title').value.trim();
                const content = document.getElementById('bc-content').value.trim();
                const level = document.getElementById('bc-level').value;

                this.broadcast.addBroadcast({ title, content, level });
                this.auth.logAudit('發布全域公告', `發布公告：${title}`);
                bcForm.reset();
                this.renderBroadcastList();
                alert('全域廣播已發布！');
            };
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SuperAdminApp();
});
