/* =====================================================
   RURAL HEALTH CONNECT – CORE APPLICATION ENGINE
   Fully Fixed Version for Blood Bank
===================================================== */

/* ---------------- GLOBAL STATE ---------------- */
const APP_STATE = {
    lastSync: null,
    emergencyActive: false,
    cachedData: null
};

const BLOOD_GROUPS = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
const BLOOD_BANK_KEY = "blood_bank_state";

let bbGroup, bbUnits;
let donorName, donorGroup, donorContact;

let showAllLogs = false;

let BLOOD_BANK_STATE = JSON.parse(localStorage.getItem(BLOOD_BANK_KEY)) || {
    inventory: {},
    donors: [],
    audit: []
};

BLOOD_GROUPS.forEach(bg => {
    BLOOD_BANK_STATE.inventory[bg] = BLOOD_BANK_STATE.inventory[bg] || 0;
});

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
                        "A+": 12, "B+": 9, "O+": 15, "AB+": 4
                    }
                },
                staff: { doctors: 3, nurses: 8, paramedics: 4 },
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

        logSystem("System synced successfully");

        if (data.emergency) triggerEmergencyMode();

    } catch (e) {
        console.warn("Retriever Error: Using Fail-safe Local Data.", e);
    }
}

function updateDashboard(data) {
    const bedCount = document.getElementById("bed-count");
    const oxygenCount = document.getElementById("oxygen-count");
    const doctorCount = document.getElementById("doctor-count");
    const lastSyncEl = document.getElementById("last-sync");

    if (bedCount) bedCount.innerText = data.inventory.beds_available;
    if (oxygenCount) oxygenCount.innerText = data.inventory.oxygen_units;
    if (doctorCount) doctorCount.innerText = data.staff.doctors;
    if (lastSyncEl) lastSyncEl.innerText = formatTime(APP_STATE.lastSync);
}

/* ---------------- EMERGENCY ---------------- */
function triggerEmergencyMode() {
    if (APP_STATE.emergencyActive) return;
    APP_STATE.emergencyActive = true;
    logSystem("Emergency mode activated");

    const box = document.getElementById("emergency-box");
    if (box) {
        box.classList.remove("d-none");
        box.innerHTML = `<h5>🚨 Emergency Alert</h5><p>High patient inflow detected. Escalation protocols active.</p>`;
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

/* ---------------- BLOOD BANK SERVICE ---------------- */
const BloodBankService = {

    validate(group, units) {
        if (!group || !units || units <= 0 || !Number.isInteger(units)) {
            alert("Select valid blood group and units (>=1)");
            return false;
        }
        return true;
    },

    addUnits() {
        if (!bbGroup || !bbUnits) return;

        const group = bbGroup.value;
        const units = parseInt(bbUnits.value);
        if (!this.validate(group, units)) return;

        BLOOD_BANK_STATE.inventory[group] += units;
        bbLog(`Added ${units} units of ${group}`);

        renderBloodInventory();
        bbGroup.value = "";
        bbUnits.value = "";
    },

    issueUnits() {
        if (!bbGroup || !bbUnits) return;

        const group = bbGroup.value;
        const units = parseInt(bbUnits.value);
        if (!this.validate(group, units)) return;

        if (BLOOD_BANK_STATE.inventory[group] < units) {
            alert("Insufficient stock");
            return;
        }

        BLOOD_BANK_STATE.inventory[group] -= units;
        bbLog(`Issued ${units} units of ${group}`);

        renderBloodInventory();
        bbGroup.value = "";
        bbUnits.value = "";
    },

    registerDonor() {
        if (!donorName || !donorGroup || !donorContact) return;

        const name = donorName.value.trim();
        const group = donorGroup.value;
        const contact = donorContact.value.trim();

        if (!name || !group || !/^\d{10}$/.test(contact)) {
            alert("Enter valid donor details");
            return;
        }

        BLOOD_BANK_STATE.donors.push({
            id: crypto.randomUUID(),
            name, group, contact,
            time: new Date().toISOString()
        });

        bbLog(`Donor registered: ${name} (${group})`);
        donorName.value = "";
        donorGroup.value = "";
        donorContact.value = "";
    }
};

/* ---------------- RENDER FUNCTIONS ---------------- */
function renderBloodInventory() {
    const container = document.getElementById("inventory-cards");
    if (!container) return;

    container.innerHTML = "";
    BLOOD_GROUPS.forEach(group => {
        const units = BLOOD_BANK_STATE.inventory[group];
        let status = "success", label = "Safe";
        if (units === 0) { status = "secondary"; label = "Out of Stock"; }
        else if (units <= 3) { status = "danger"; label = "Critical"; }
        else if (units <= 7) { status = "warning"; label = "Monitor"; }

        container.innerHTML += `
            <div class="col-md-3">
                <div class="card border-${status} shadow-sm text-center">
                    <div class="card-body">
                        <h5>${group}</h5>
                        <p class="display-6 text-${status}">${units}</p>
                        <small>${label}</small>
                    </div>
                </div>
            </div>
        `;
    });
}

function renderBloodBankAudit() {
    const list = document.getElementById("bb-audit-log");
    if (!list) return;

    list.innerHTML = "";
    const logs = showAllLogs ? BLOOD_BANK_STATE.audit : BLOOD_BANK_STATE.audit.slice(0, 10);
    logs.forEach(log => {
        list.innerHTML += `<li>[${log.time}] ${log.message}</li>`;
    });
}

function toggleBloodLogs() {
    showAllLogs = !showAllLogs;
    renderBloodBankAudit();
}

/* ---------------- INIT ---------------- */
window.addEventListener("load", () => {
    // assign elements after DOM is ready
    bbGroup = document.getElementById("bb-group");
    bbUnits = document.getElementById("bb-units");
    donorName = document.getElementById("donor-name");
    donorGroup = document.getElementById("donor-group");
    donorContact = document.getElementById("donor-contact");

    restoreData();
    syncFacilityData();
    renderBloodInventory();
    renderBloodBankAudit();

    // auto sync every 15s
    setInterval(syncFacilityData, 15000);
});
