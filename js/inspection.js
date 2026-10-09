import { STORAGE_KEYS } from './constants.js';

export class SuperAdminInspection {
    constructor(tenantManager) {
        this.tenantManager = tenantManager;
    }

    renderInspectionView(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const tenants = this.tenantManager.getTenants();

        let html = `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
                    <div>
                        <h2 class="text-xl font-black text-white flex items-center gap-2.5">
                            <i class="fa-solid fa-magnifying-glass-chart text-indigo-400"></i>
                            <span class="no-wrap">多校行政穿透抽查中樞</span>
                        </h2>
                        <p class="text-xs text-slate-400 mt-1">最高管理員可即時調閱各校晨間出缺席通報率、作業缺繳率與行政核章進度</p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <span class="text-xs text-slate-400 no-wrap">授權學校：</span>
                        <span class="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 font-bold text-xs rounded-lg border border-indigo-500/30 no-wrap">
                            共 ${tenants.length} 所學校
                        </span>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        `;

        tenants.forEach(school => {
            const isHigh = school.todayAttendanceRate >= 98;
            const rateColor = isHigh ? 'text-emerald-400' : 'text-amber-400';
            const badgeBg = isHigh ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

            html += `
                <div class="glass-card rounded-2xl p-5 space-y-4 hover:border-indigo-500/40 transition-all group">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <span class="text-[10px] font-mono font-bold text-indigo-400 tracking-wider block">${school.id}</span>
                            <h3 class="text-base font-bold text-white group-hover:text-indigo-300 transition-colors no-wrap truncate">${school.name}</h3>
                            <span class="text-xs text-slate-400 no-wrap">管理帳號：<span class="text-slate-300 font-mono">${school.adminAccount}</span></span>
                        </div>
                        <span class="px-2 py-0.5 rounded text-[11px] font-bold border no-wrap ${badgeBg}">
                            ${school.status === 'active' ? '正常運行' : '已凍結'}
                        </span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50">
                        <div class="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/40">
                            <span class="text-[10px] text-slate-400 block no-wrap">今日到校率</span>
                            <span class="text-lg font-black ${rateColor} no-wrap">${school.todayAttendanceRate}%</span>
                        </div>
                        <div class="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/40">
                            <span class="text-[10px] text-slate-400 block no-wrap">授權班級數</span>
                            <span class="text-lg font-black text-slate-200 no-wrap">${school.maxClasses} 班</span>
                        </div>
                    </div>

                    <div class="pt-2 flex items-center justify-between gap-2">
                        <span class="text-[11px] text-slate-400 truncate">
                            <i class="fa-solid fa-user-shield text-slate-500 mr-1"></i> ${school.contactPerson}
                        </span>
                        <a href="https://ian1021228.github.io/school_admin_dashboard_dev/" target="_blank" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0 no-wrap" title="穿透進入該校管理中心">
                            <span>穿透巡查</span>
                            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                        </a>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
    }
}
