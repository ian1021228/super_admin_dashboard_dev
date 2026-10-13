// Firebase 初始化與全域資料庫互動模組 (最高系統管理端專用)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

import { firebaseConfig, globalAppId, DEFAULT_TENANTS } from './constants.js';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export { onAuthStateChanged, signInWithPopup, signOut };

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ==========================================
// 學校租戶 (School Tenants)
// 存儲路徑：userProfiles/sys_school_tenants
// ==========================================
export async function getSchoolTenantsFromCloud() {
    const localKey = 'super_admin_tenants_cache';
    let cached = [];
    try {
        cached = JSON.parse(localStorage.getItem(localKey) || '[]');
    } catch (e) {}

    try {
        const docRef = doc(db, 'artifacts', globalAppId, 'public', 'data', 'userProfiles', 'sys_school_tenants');
        const snap = await getDoc(docRef);
        if (snap.exists() && Array.isArray(snap.data()?.list) && snap.data().list.length > 0) {
            const list = snap.data().list;
            localStorage.setItem(localKey, JSON.stringify(list));
            return list;
        }
    } catch (err) {
        console.warn("自雲端取得學校租戶提示:", err);
    }

    if (cached.length > 0) return cached;

    // 預設租戶清單初次同步至雲端
    const initial = [...DEFAULT_TENANTS];
    localStorage.setItem(localKey, JSON.stringify(initial));
    try {
        const docRef = doc(db, 'artifacts', globalAppId, 'public', 'data', 'userProfiles', 'sys_school_tenants');
        await setDoc(docRef, { list: initial, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {}
    return initial;
}

export async function saveSchoolTenantToCloud(schoolData) {
    const docId = schoolData.id || `SCH-${Math.floor(100 + Math.random() * 900)}`;
    const payload = {
        ...schoolData,
        id: docId,
        updatedAt: new Date().toISOString()
    };

    const localKey = 'super_admin_tenants_cache';
    let list = [];
    try { list = JSON.parse(localStorage.getItem(localKey) || '[]'); } catch (e) {}
    const idx = list.findIndex(s => s.id === docId || s.code === schoolData.code);
    if (idx >= 0) list[idx] = { ...list[idx], ...payload };
    else list.push(payload);
    localStorage.setItem(localKey, JSON.stringify(list));

    // 1. 寫入 sys_school_tenants
    try {
        const docRef = doc(db, 'artifacts', globalAppId, 'public', 'data', 'userProfiles', 'sys_school_tenants');
        await setDoc(docRef, { list, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
        console.warn("同步至雲端學校租戶提示:", e);
    }

    // 2. 自動在 boundAccounts 建立該校管理員帳號，讓學校端可直接登入！
    if (schoolData.adminAccount && schoolData.adminPassword) {
        try {
            const accDocRef = doc(db, 'artifacts', globalAppId, 'public', 'data', 'boundAccounts', schoolData.adminAccount.toLowerCase().trim());
            await setDoc(accDocRef, {
                username: schoolData.adminAccount.trim(),
                password: schoolData.adminPassword,
                role: 'school_admin',
                schoolId: docId,
                schoolName: schoolData.name,
                schoolCode: schoolData.code,
                isSchoolAdmin: true,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (e) {
            console.warn("建立學校管理員 boundAccount 提示:", e);
        }
    }

    return payload;
}

export async function deleteSchoolTenantFromCloud(schoolId) {
    const localKey = 'super_admin_tenants_cache';
    let list = [];
    try { list = JSON.parse(localStorage.getItem(localKey) || '[]'); } catch (e) {}
    const target = list.find(s => s.id === schoolId);
    list = list.filter(s => s.id !== schoolId);
    localStorage.setItem(localKey, JSON.stringify(list));

    try {
        const docRef = doc(db, 'artifacts', globalAppId, 'public', 'data', 'userProfiles', 'sys_school_tenants');
        await setDoc(docRef, { list, updatedAt: new Date().toISOString() }, { merge: true });

        if (target?.adminAccount) {
            const accDocRef = doc(db, 'artifacts', globalAppId, 'public', 'data', 'boundAccounts', target.adminAccount.toLowerCase().trim());
            await deleteDoc(accDocRef);
        }
    } catch (e) {
        console.warn("刪除雲端學校租戶提示:", e);
    }
}

// ==========================================
// 全域校安緊急廣播 (Global System Broadcasts)
// 存儲路徑：systemBroadcasts/main
// ==========================================
export async function getGlobalBroadcastsFromCloud() {
    try {
        const docRef = doc(db, 'artifacts', globalAppId, 'public', 'data', 'systemBroadcasts', 'main');
        const snap = await getDoc(docRef);
        if (snap.exists() && Array.isArray(snap.data()?.broadcasts)) {
            return snap.data().broadcasts;
        }
    } catch (e) {
        console.warn("自雲端取得全域廣播提示:", e);
    }
    return [];
}

export async function saveGlobalBroadcastToCloud(broadcastData) {
    const docRef = doc(db, 'artifacts', globalAppId, 'public', 'data', 'systemBroadcasts', 'main');
    let currentList = [];
    try {
        const snap = await getDoc(docRef);
        if (snap.exists() && Array.isArray(snap.data()?.broadcasts)) {
            currentList = snap.data().broadcasts;
        }
    } catch (e) {}

    const payload = {
        id: broadcastData.id || `BC-${Date.now().toString().slice(-4)}`,
        title: broadcastData.title,
        content: broadcastData.content,
        level: broadcastData.level || 'info',
        sender: broadcastData.sender || '最高系統管理員',
        active: broadcastData.active !== false,
        createdAt: broadcastData.createdAt || new Date().toLocaleString('zh-TW', { hour12: false })
    };

    currentList.unshift(payload);
    await setDoc(docRef, {
        broadcasts: currentList,
        latest: payload,
        updatedAt: new Date().toISOString()
    }, { merge: true });

    return payload;
}

export async function deleteGlobalBroadcastFromCloud(id) {
    const docRef = doc(db, 'artifacts', globalAppId, 'public', 'data', 'systemBroadcasts', 'main');
    let currentList = [];
    try {
        const snap = await getDoc(docRef);
        if (snap.exists() && Array.isArray(snap.data()?.broadcasts)) {
            currentList = snap.data().broadcasts.filter(b => b.id !== id);
            await setDoc(docRef, {
                broadcasts: currentList,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        }
    } catch (e) {}
}

// ==========================================
// 真實學校即時數據查核 (Live Inspection)
// ==========================================
export async function getSchoolLiveStats(schoolId) {
    try {
        const classesRef = doc(db, 'artifacts', globalAppId, 'public', 'data', 'userProfiles', `sch_classes_${schoolId}`);
        const snap = await getDoc(classesRef);
        if (snap.exists() && Array.isArray(snap.data()?.list)) {
            const classes = snap.data().list;
            const totalStudents = classes.reduce((acc, c) => acc + (c.studentCount || 30), 0);
            return {
                classCount: classes.length,
                totalStudents: totalStudents,
                isLive: true
            };
        }
    } catch (e) {}
    return null;
}
