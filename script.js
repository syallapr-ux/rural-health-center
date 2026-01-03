console.log("script.js loaded");

/* =====================================================
   RURAL HEALTH CONNECT – CORE APPLICATION ENGINE
   (Interview-safe, non-PWA version)
   ===================================================== */

/* -------- GLOBAL STATE -------- */
const APP_STATE = {
    lastSync: null,
    emergencyActive: false,
    cachedData: null
};

/* -------- UTILITIES -------- */
function formatTime(ts) {
    return new Date(ts).toLocaleString();
}

function logSystem(msg) {
    console.log("[IRHIS]", msg);
}

/* -------- MOCK BACKEND -------- */
// Mock values generated to simulate real-time facility load
async function fetchHealthData() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                emergency: Math.random() > 0.8
            });
        }, 700);
    });
}

/* -------- DATA SYNC -------- */
async function syncFacilityData() {
    try {
        const data = await fetchHealthData();

        APP_STATE.cachedData = data;
        APP_STATE.lastSync = Date.now(); // SET FIRST

        updateDepartmentUI(data);
        persistData(data);

        if (data.emergency) triggerEmergencyMode();

        logSystem("System synced");
    } catch (e) {
        console.warn("Using local cached data (backend simulation)");
        restoreData();
    }
}

/* -------- UI UPDATE -------- */
function updateDepartmentUI(data) {
    const syncEl = document.getElementById("last-sync");
    if (syncEl) syncEl.innerText = formatTime(APP_STATE.lastSync);

    const badge = document.getElementById("emergency-status");
    const card = document.querySelector(".emergency-card");

    if (data.emergency) {
        badge.innerText = "High Load";
        badge.className = "badge bg-danger ms-2";
        card?.classList.add("emergency-active");
    } else {
        badge.innerText = "Normal";
        badge.className = "badge bg-success ms-2";
        card?.classList.remove("emergency-active");
    }
}

/* -------- EMERGENCY MODE -------- */
function triggerEmergencyMode() {
    if (APP_STATE.emergencyActive) return;
    APP_STATE.emergencyActive = true;
    logSystem("Emergency mode activated");
}

/* -------- LOCAL STORAGE -------- */
function persistData(data) {
    localStorage.setItem("irhis_cache", JSON.stringify({
        data,
        timestamp: APP_STATE.lastSync
    }));
}

function restoreData() {
    const cached = localStorage.getItem("irhis_cache");
    if (!cached) return;

    const parsed = JSON.parse(cached);
    APP_STATE.cachedData = parsed.data;
    APP_STATE.lastSync = parsed.timestamp;

    updateDepartmentUI(parsed.data);
    logSystem("Restored cached data");
}

/* -------- REFERRAL -------- */
function generateReferral() {
    alert("Digital referral summary generated (FHIR simulation)");
}

/* -------- INIT -------- */
window.addEventListener("load", () => {
    restoreData();
    syncFacilityData();
});

/* Auto-sync every 15 seconds */
setInterval(syncFacilityData, 15000);

/*
 NOTE:
 PWA / Service Worker intentionally disabled
 to avoid cache issues during interview/demo.
 Can be enabled in production.
*/
