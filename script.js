/* =====================================================
   RURAL HEALTH CONNECT – CORE APPLICATION ENGINE
   Static + PWA + API Simulation (GitHub Pages Safe)
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

/* ---------------- MOCK API (STATIC SAFE) ---------------- */
/* This simulates backend APIs until real endpoints exist */
async function fetchHealthData() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                facility: {
                    name: "Primary Health Centre – Rural Block",
                    district: "Sample District",
                    state: "Tamil Nadu"
                },
                inventory: {
                    beds_total: 40,
                    beds_available: Math.floor(Math.random() * 15) + 5,
                    oxygen_units: Math.floor(Math.random() * 50) + 20,
                    blood_units: {
                        "A+": 12,
                        "B+": 9,
                        "O+": 15,
                        "AB+": 4
                    }
                },
                staff: {
                    doctors: 3,
                    nurses: 8,
                    paramedics: 4
                },
                emergency: Math.random() > 0.85
            });
        }, 800);
    });
}

/* ---------------- DATA SYNC ENGINE ---------------- */
async function syncFacilityData() {
    try {
        const data = await fetchHealthData();
        APP_STATE.cachedData = data;
        APP_STATE.lastSync = Date.now();

        updateDashboard(data);
        persistData(data);

        logSystem("System synced successfully");

        if (data.emergency) {
            triggerEmergencyMode();
        }

    } catch (e) {
        console.error("Sync failed", e);
    }
}

/* ---------------- DOM UPDATE ---------------- */
function updateDashboard(data) {
    if (document.getElementById("bed-count")) {
        document.getElementById("bed-count").innerText =
            data.inventory.beds_available;
    }

    if (document.getElementById("oxygen-count")) {
        document.getElementById("oxygen-count").innerText =
            data.inventory.oxygen_units;
    }

    if (document.getElementById("doctor-count")) {
        document.getElementById("doctor-count").innerText =
            data.staff.doctors;
    }

    if (document.getElementById("last-sync")) {
        document.getElementById("last-sync").innerText =
            formatTime(APP_STATE.lastSync);
    }
}

/* ---------------- EMERGENCY HANDLING ---------------- */
function triggerEmergencyMode() {
    if (APP_STATE.emergencyActive) return;

    APP_STATE.emergencyActive = true;
    logSystem("Emergency mode activated");

    const box = document.getElementById("emergency-box");
    if (box) {
        box.classList.remove("d-none");
        box.innerHTML = `
            <h5>🚨 Emergency Alert</h5>
            <p>High patient inflow detected. Escalation protocols active.</p>
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

    updateDashboard(parsed.data);
    logSystem("Restored data from local cache");
}

/* ---------------- MAP INTEGRATION ---------------- */
function initMap() {
    const mapEl = document.getElementById("map");
    if (!mapEl) return;

    mapEl.innerHTML = `
        <iframe
            width="100%"
            height="100%"
            frameborder="0"
            style="border:0"
            referrerpolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Primary+Health+Centre&output=embed"
            allowfullscreen>
        </iframe>
    `;
}

/* ---------------- TELEMEDICINE FORM ---------------- */
function handleTelemedicineForm() {
    const form = document.getElementById("telemedicine-form");
    if (!form) return;

    form.addEventListener("submit", e => {
        e.preventDefault();

        const name = form.querySelector("#patient-name").value;
        const complaint = form.querySelector("#complaint").value;

        alert(
            `Consultation Requested\n\nPatient: ${name}\nIssue: ${complaint}\n\nA doctor will connect shortly.`
        );

        form.reset();
    });
}

/* ---------------- SERVICE WORKER (PWA) ---------------- */
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("sw.js")
            .then(() => logSystem("Service Worker Registered"))
            .catch(err => console.error("SW registration failed", err));
    });
}

/* ---------------- INIT ---------------- */
window.addEventListener("load", () => {
    restoreData();
    syncFacilityData();
    initMap();
    handleTelemedicineForm();
});

/* Auto-sync every 15 seconds */
setInterval(syncFacilityData, 15000);
