/* =====================================================
   BLOOD BANK MODULE – FULLY FUNCTIONAL
   ===================================================== */

const BLOOD_GROUPS = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
const BLOOD_BANK_KEY = "blood_bank_state";
const DONATION_COOLDOWN_DAYS = 90;

/* ---------- STATE ---------- */
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

/* ---------- LOGGING ---------- */
function bbLog(message) {
    BLOOD_BANK_STATE.audit.unshift({
        message,
        time: new Date().toLocaleString()
    });
    saveBloodBankState();
    renderBloodBankAudit();
}

/* ---------- SERVICE ---------- */
window.BloodBankService = {

    addUnits() {
        const group = bbGroupValue();
        const units = bbUnitsValue();
        if (!validateInventory(group, units)) return;

        BLOOD_BANK_STATE.inventory[group] += units;
        bbLog(`Added ${units} units of ${group}`);
        saveBloodBankState();
        renderBloodInventory();
    },

    issueUnits() {
        const group = bbGroupValue();
        const units = bbUnitsValue();
        if (!validateInventory(group, units)) return;

        if (BLOOD_BANK_STATE.inventory[group] < units) {
            alert("Insufficient stock");
            return;
        }

        BLOOD_BANK_STATE.inventory[group] -= units;
        bbLog(`Issued ${units} units of ${group}`);
        saveBloodBankState();
        renderBloodInventory();
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
            lastDonation: null
        });

        bbLog(`Donor registered: ${name} (${group})`);
        saveBloodBankState();
        renderDonors();

        document.getElementById("donor-name").value = "";
        document.getElementById("donor-group").value = "";
        document.getElementById("donor-contact").value = "";
    }
};

/* ---------- HELPERS ---------- */
function bbGroupValue() {
    return document.getElementById("bb-group").value;
}

function bbUnitsValue() {
    return parseInt(document.getElementById("bb-units").value);
}

function validateInventory(group, units) {
    if (!group || !units || units <= 0) {
        alert("Enter valid blood group and units");
        return false;
    }
    return true;
}

/* ---------- DONOR MANAGEMENT ---------- */
function canDonate(donor) {
    if (!donor.lastDonation) return true;
    const days =
        (Date.now() - donor.lastDonation) / (1000 * 60 * 60 * 24);
    return days >= DONATION_COOLDOWN_DAYS;
}

function acceptDonation(id) {
    const donor = BLOOD_BANK_STATE.donors.find(d => d.id === id);
    if (!donor || !canDonate(donor)) return;

    BLOOD_BANK_STATE.inventory[donor.group] += 1;
    donor.lastDonation = Date.now();

    bbLog(`Donation accepted from ${donor.name} (${donor.group})`);
    saveBloodBankState();
    renderBloodInventory();
    renderDonors();
}

function renderDonors() {
    const table = document.getElementById("donor-table");
    if (!table) return;

    table.innerHTML = "";

    BLOOD_BANK_STATE.donors.forEach(donor => {
        const eligible = canDonate(donor);

        table.innerHTML += `
            <tr>
                <td>${donor.name}</td>
                <td>${donor.group}</td>
                <td>${donor.contact}</td>
                <td>
                    <button class="btn btn-sm ${
                        eligible ? "btn-success" : "btn-secondary"
                    }"
                    ${eligible ? "" : "disabled"}
                    onclick="acceptDonation('${donor.id}')">
                        ${eligible ? "Accept Donation" : "Cooldown"}
                    </button>
                </td>
            </tr>
        `;
    });
}

/* ---------- INVENTORY RENDER ---------- */
function renderBloodInventory() {
    const container = document.getElementById("inventory-cards");
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
            </div>`;
    });
}

/* ---------- AUDIT ---------- */
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
    renderDonors();
});
