/* =====================================================
   BLOOD BANK MODULE – ISOLATED & STABLE
   ===================================================== */

const BLOOD_GROUPS = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
const BLOOD_BANK_KEY = "blood_bank_state";

/* ---------- STATE ---------- */
let BLOOD_BANK_STATE = JSON.parse(localStorage.getItem(BLOOD_BANK_KEY)) || {
    inventory: {},
    donors: [],
    audit: []
};

BLOOD_GROUPS.forEach(bg => {
    if (BLOOD_BANK_STATE.inventory[bg] == null) {
        BLOOD_BANK_STATE.inventory[bg] = 0;
    }
});

function saveBloodBankState() {
    localStorage.setItem(BLOOD_BANK_KEY, JSON.stringify(BLOOD_BANK_STATE));
}

/* ---------- LOGGING ---------- */
function bbLog(message) {
    BLOOD_BANK_STATE.audit.unshift({
        message,
        time: new Date().toLocaleString()
    });
    saveBloodBankState();
    renderBloodBankAudit();
}

/* ---------- SERVICE (GLOBAL) ---------- */
window.BloodBankService = {

    addUnits() {
        const group = document.getElementById("bb-group").value;
        const units = parseInt(document.getElementById("bb-units").value);

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
        const group = document.getElementById("bb-group").value;
        const units = parseInt(document.getElementById("bb-units").value);

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
        const name = document.getElementById("donor-name").value.trim();
        const group = document.getElementById("donor-group").value;
        const contact = document.getElementById("donor-contact").value.trim();

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

/* ---------- RENDERING ---------- */
function renderBloodInventory() {
    const container = document.getElementById("inventory-cards");
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
                <div class="card border-${status} shadow-sm text-center">
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
    list.innerHTML = "";

    const logs = showAllLogs
        ? BLOOD_BANK_STATE.audit
        : BLOOD_BANK_STATE.audit.slice(0, 10);

    logs.forEach(log => {
        list.innerHTML += `<li>[${log.time}] ${log.message}</li>`;
    });
}

function toggleBloodLogs() {
    showAllLogs = !showAllLogs;
    renderBloodBankAudit();
}

/* ---------- INIT ---------- */
window.addEventListener("load", () => {
    document.getElementById("last-sync").innerText =
        new Date().toLocaleString();

    renderBloodInventory();
    renderBloodBankAudit();
});
