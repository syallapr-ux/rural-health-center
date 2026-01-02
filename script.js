/* =====================================================
   RURAL HEALTH CONNECT – CORE APPLICATION ENGINE
   Static + PWA + API Simulation
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

        if (data.emergency) triggerEmergencyMode();
    } catch (e) {
        console.warn("Sync failed", e);
    }
}

/* ---------------- DASHBOARD UPDATE ---------------- */
function updateDashboard(data) {
    if (document.getElementById("bed-count"))
        document.getElementById("bed-count").innerText = data.inventory.beds_available;

    if (document.getElementById("oxygen-count"))
        document.getElementById("oxygen-count").innerText = data.inventory.oxygen_units;

    if (document.getElementById("doctor-count"))
        document.getElementById("doctor-count").innerText = data.staff.doctors;

    if (document.getElementById("last-sync"))
        document.getElementById("last-sync").innerText = formatTime(APP_STATE.lastSync);
}

/* ---------------- EMERGENCY ---------------- */
function triggerEmergencyMode() {
    if (APP_STATE.emergencyActive) return;
    APP_STATE.emergencyActive = true;
    logSystem("Emergency mode activated");
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

    if (document.getElementById("last-sync"))
        document.getElementById("last-sync").innerText = formatTime(APP_STATE.lastSync);
}

/* =====================================================
   BLOOD BANK MODULE
   ===================================================== */

const BLOOD_GROUPS = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
const BLOOD_BANK_KEY = "blood_bank_state";

let BLOOD_BANK_STATE = JSON.parse(localStorage.getItem(BLOOD_BANK_KEY)) || {
    inventory: {},
    donors: [],
    audit: []
};

BLOOD_GROUPS.forEach(bg => {
    BLOOD_BANK_STATE.inventory[bg] ??= 0;
});

function saveBloodBankState() {
    localStorage.setItem(BLOOD_BANK_KEY, JSON.stringify(BLOOD_BANK_STATE));
}

function bbLog(message) {
    BLOOD_BANK_STATE.audit.unshift({
        message,
        time: new Date().toLocaleString()
    });
    saveBloodBankState();
    renderBloodBankAudit();
}

const BloodBankService = {

    addUnits() {
        const group = document.getElementById("bb-group")?.value;
        const units = parseInt(document.getElementById("bb-units")?.value);

        if (!group || !units || units <= 0) {
            alert("Enter valid blood group and units");
            return;
        }

        BLOOD_BANK_STATE.inventory[group] += units;
        bbLog(`Added ${units} units of ${group}`);
        renderBloodInventory();

        document.getElementById("bb-group").value = "";
        document.getElementById("bb-units").value = "";
    },

    issueUnits() {
        const group = document.getElementById("bb-group")?.value;
        const units = parseInt(document.getElementById("bb-units")?.value);

        if (!group || !units || units <= 0) {
            alert("Enter valid blood group and units");
            return;
        }

        if (BLOOD_BANK_STATE.inventory[group] < units) {
            alert("Insufficient stock");
            return;
        }

        BLOOD_BANK_STATE.inventory[group] -= units;
        bbLog(`Issued ${units} units of ${group}`);
        renderBloodInventory();

        document.getElementById("bb-group").value = "";
        document.getElementById("bb-units").value = "";
    },

    registerDonor() {
        const name = document.getElementById("donor-name")?.value.trim();
        const group = document.getElementById("donor-group")?.value;
        const contact = document.getElementById("donor-contact")?.value.trim();

        if (!name || !group || !/^\d{10}$/.test(contact)) {
            alert("Enter valid donor details");
            return;
        }

        BLOOD_BANK_STATE.donors.push({
            id: crypto.randomUUID(),
            name,
            group,
            contact,
            time: new Date().toISOString()
        });

        bbLog(`Donor registered: ${name} (${group})`);

        document.getElementById("donor-name").value = "";
        document.getElementById("donor-group").value = "";
        document.getElementById("donor-contact").value = "";
    }
};

function renderBloodInventory() {
    const container = document.getElementById("inventory-cards");
    if (!container) return;

    container.innerHTML = "";

    BLOOD_GROUPS.forEach(group => {
        const units = BLOOD_BANK_STATE.inventory[group];
        let status = "success";
        let label = "Safe";

        if (units === 0) { status = "secondary"; label = "Out of Stock"; }
        else if (units <= 3) { status = "danger"; label = "Critical"; }
        else if (units <= 7) { status = "warning"; label = "Monitor"; }

        container.innerHTML += `
            <div class="col-md-3">
                <div class="card border-${status} text-center">
                    <div class="card-body">
                        <h5>${group}</h5>
                        <p class="display-6 text-${status}">${units}</p>
                        <small>${label}</small>
                    </div>
                </div>
            </div>`;
    });
}

let showAllLogs = false;

function renderBloodBankAudit() {
    const list = document.getElementById("bb-audit-log");
    if (!list) return;

    list.innerHTML = "";
    const logs = showAllLogs ? BLOOD_BANK_STATE.audit : BLOOD_BANK_STATE.audit.slice(0,10);

    logs.forEach(l => {
        list.innerHTML += `<li>[${l.time}] ${l.message}</li>`;
    });
}

function toggleBloodLogs() {
    showAllLogs = !showAllLogs;
    renderBloodBankAudit();
}

/* ---------------- INIT ---------------- */
window.addEventListener("load", () => {
    restoreData();
    syncFacilityData();
    renderBloodInventory();
    renderBloodBankAudit();
});

setInterval(syncFacilityData, 15000);
