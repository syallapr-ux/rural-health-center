/* =====================================================
   RURAL HEALTH CONNECT – CORE APPLICATION ENGINE
   SAFE MULTI-PAGE VERSION
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
async function fetchHealthData() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                inventory: {
                    beds_available: Math.floor(Math.random() * 15) + 5,
                    oxygen_units: Math.floor(Math.random() * 50) + 20
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

        updateDashboard(data);
        persistData(data);

        if (data.emergency) {
            triggerEmergencyMode();
        }

        logSystem("System synced");

    } catch (e) {
        console.warn("Sync failed", e);
    }
}

/* ---------------- DASHBOARD UPDATE ---------------- */
function updateDashboard(data) {

    const bedEl = document.getElementById("bed-count");
    if (bedEl) bedEl.innerText = data.inventory.beds_available;

    const oxyEl = document.getElementById("oxygen-count");
    if (oxyEl) oxyEl.innerText = data.inventory.oxygen_units;

    const docEl = document.getElementById("doctor-count");
    if (docEl) docEl.innerText = data.staff.doctors;

    const syncEl = document.getElementById("last-sync");
    if (syncEl) syncEl.innerText = formatTime(APP_STATE.lastSync);
}

/* ---------------- EMERGENCY MODE ---------------- */
function triggerEmergencyMode() {
    if (APP_STATE.emergencyActive) return;

    APP_STATE.emergencyActive = true;
    logSystem("Emergency mode activated");

    const box = document.getElementById("emergency-box");
    if (box) {
        box.classList.remove("d-none");
        box.innerHTML = `
            <h5>🚨 Emergency Alert</h5>
            <p>High patient inflow detected.</p>
        `;
    }
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

    const syncEl = document.getElementById("last-sync");
    if (syncEl) syncEl.innerText = formatTime(APP_STATE.lastSync);

    logSystem("Restored cached data");
}

/* ---------------- MAP (SAFE) ---------------- */
function initMap() {
    const mapEl = document.getElementById("map");
    if (!mapEl) return;

    mapEl.innerHTML = `
        <iframe
            width="100%"
            height="100%"
            style="border:0"
            src="https://www.google.com/maps?q=Primary+Health+Centre&output=embed"
            loading="lazy">
        </iframe>
    `;
}

/* ---------------- TELEMEDICINE (SAFE) ---------------- */
function handleTelemedicineForm() {
    const form = document.getElementById("telemedicine-form");
    if (!form) return;

    form.addEventListener("submit", e => {
        e.preventDefault();

        const name = form.querySelector("#patient-name")?.value;
        const issue = form.querySelector("#complaint")?.value;

        alert(
            `Consultation Requested\n\nPatient: ${name}\nIssue: ${issue}`
        );

        form.reset();
    });
}

/* ---------------- PWA ---------------- */
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("sw.js")
            .then(() => logSystem("PWA active"))
            .catch(err => console.error("SW failed", err));
    });
}

/* ---------------- INIT ---------------- */
window.addEventListener("load", () => {
    restoreData();
    syncFacilityData();
    initMap();
    handleTelemedicineForm();
});

/* Auto sync every 15s */
setInterval(syncFacilityData, 15000);
