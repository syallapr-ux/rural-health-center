console.log("script.js loaded");

/* =====================================================
   RURAL HEALTH CONNECT – SHARED APPLICATION SCRIPT
   Safe for all modules
   ===================================================== */

const USER_ROLE = "public"; // change to "admin" for admin view

const APP_STATE = {
    lastSync: null,
    cachedData: null,
    emergencyActive: false
};

/* ---------- PAGE GUARDS ---------- */
const IS_DEPARTMENTS_PAGE =
    document.querySelector(".emergency-card") !== null;

/* ---------- UTILITIES ---------- */
function formatTime(ts) {
    return new Date(ts).toLocaleString();
}

/* ---------- MOCK BACKEND ---------- */
async function fetchHealthData() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                emergency: Math.random() > 0.8,
                beds: 24 + Math.floor(Math.random() * 10),
                oxygen: "Stable"
            });
        }, 600);
    });
}

/* ---------- DEPARTMENTS MODULE ---------- */
function applyRoleVisibility() {
    if (USER_ROLE === "public") {
        document.getElementById("referral-panel")?.remove();
    }
}

function updateDepartmentUI(data) {
    const badge = document.getElementById("emergency-status");
    const card = document.querySelector(".emergency-card");
    const syncEl = document.getElementById("last-sync");

    if (syncEl && APP_STATE.lastSync) {
        syncEl.innerText = formatTime(APP_STATE.lastSync);
    }

    if (!badge || !card) return;

    if (data.emergency) {
        badge.innerText = "High Load";
        badge.className = "badge bg-danger ms-2";
        if (USER_ROLE === "admin") {
            card.classList.add("emergency-active");
        }
    } else {
        badge.innerText = "Normal";
        badge.className = "badge bg-success ms-2";
        card.classList.remove("emergency-active");
    }
}

async function syncFacilityData() {
    try {
        const data = await fetchHealthData();
        APP_STATE.cachedData = data;
        APP_STATE.lastSync = Date.now();

        updateDepartmentUI(data);
        updateDashboardStats(data);

        localStorage.setItem("rhc_cache", JSON.stringify({
            data,
            timestamp: APP_STATE.lastSync
        }));
    } catch {
        restoreCachedData();
    }
}

function restoreCachedData() {
    const cache = localStorage.getItem("rhc_cache");
    if (!cache) return;

    const parsed = JSON.parse(cache);
    APP_STATE.cachedData = parsed.data;
    APP_STATE.lastSync = parsed.timestamp;

    updateDepartmentUI(parsed.data);
    updateDashboardStats(parsed.data);
}

/* ---------- DASHBOARD STATS ---------- */
function updateDashboardStats(data) {
    const bedsEl = document.getElementById("bed-count");
    const oxygenEl = document.getElementById("oxygen-status");

    if (bedsEl) bedsEl.innerText = data.beds ?? "--";
    if (oxygenEl) oxygenEl.innerText = data.oxygen ?? "--";
}

/* ---------- REFERRAL ---------- */
function generateReferral() {
    alert("Referral request initiated (FHIR simulation)");
}

/* ---------- INIT ---------- */
window.addEventListener("load", () => {
    restoreCachedData();

    if (IS_DEPARTMENTS_PAGE) {
        applyRoleVisibility();
        syncFacilityData();
        setInterval(syncFacilityData, 15000);
    } else {
        syncFacilityData();
    }
});
