/* =====================================================
   RURAL HEALTH CONNECT – CORE APPLICATION ENGINE
   ===================================================== */

/* ---------------- GLOBAL STATE ---------------- */
const APP_STATE = {
    lastSync: null,
    emergencyActive: false,
    cachedData: null
};

/* ---------------- UTILITIES ---------------- */
function formatTime(ts) {
    return new Date(ts).toLocaleString();
}

function logSystem(msg) {
    console.log("[IRHIS]", msg);
}

/* ---------------- MOCK API ---------------- */
/* Mock values generated to simulate real-time facility load */
async function fetchHealthData() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                inventory: {
                    beds_available: Math.floor(Math.random() * 10) + 5,
                    oxygen_units: Math.floor(Math.random() * 30) + 20
                },
                staff: {
                    doctors: 3
                },
                emergency: Math.random() > 0.85
            });
        }, 800);
    });
}

/* ---------------- DATA SYNC ---------------- */
async function syncFacilityData() {
    try {
        const data = await fetchHealthData();
        APP_STATE.cachedData = data;
        APP_STATE.lastSync = Date.now();

        updateDepartmentUI(data);
        persistData(data);

        if (data.emergency) triggerEmergencyMode();

        logSystem("System synced");

    } catch (e) {
        showSystemMessage("Offline mode active");
    }
}

/* ---------------- UI UPDATES ---------------- */
function updateDepartmentUI(data) {
    const syncEl = document.getElementById("last-sync");
    if (syncEl) syncEl.innerText = formatTime(APP_STATE.lastSync);

    const emergencyBadge = document.getElementById("emergency-status");
    if (emergencyBadge) {
        if (data.emergency) {
            emergencyBadge.innerText = "High Load";
            emergencyBadge.className = "badge bg-danger ms-2";
        } else {
            emergencyBadge.innerText = "Normal";
            emergencyBadge.className = "badge bg-success ms-2";
        }
    }
}

/* ---------------- EMERGENCY MODE ---------------- */
function triggerEmergencyMode() {
    if (APP_STATE.emergencyActive) return;
    APP_STATE.emergencyActive = true;

    document.querySelector(".emergency-card")
        ?.classList.add("emergency-active");

    logSystem("Emergency mode activated");
}

/* ---------------- SYSTEM MESSAGE ---------------- */
function showSystemMessage(msg) {
    console.warn(msg);
}

/* ---------------- LOCAL STORAGE ---------------- */
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

/* ---------------- REFERRAL ---------------- */
function generateReferral() {
    alert("Digital referral summary generated (FHIR simulation)");
}

/* ---------------- INIT ---------------- */
window.addEventListener("load", () => {
    restoreData();
    syncFacilityData();
});

/* Auto sync every 15s */
setInterval(syncFacilityData, 15000);
