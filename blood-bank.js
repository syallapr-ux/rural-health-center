/* =====================================================
   BLOOD BANK MODULE – FULLY FUNCTIONAL (INTERVIEW READY)
   ===================================================== */

const BLOOD_GROUPS = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
const BLOOD_BANK_KEY = "blood_bank_state";
const DONATION_COOLDOWN_DAYS = 90;

/* ---------- BLOOD COMPATIBILITY ---------- */
const COMPATIBILITY = {
    "A+": ["A+","A-","O+","O-"],
    "A-": ["A-","O-"],
    "B+": ["B+","B-","O+","O-"],
    "B-": ["B-","O-"],
    "AB+": BLOOD_GROUPS,
    "AB-": ["AB-","A-","B-","O-"],
    "O+": ["O+","O-"],
    "O-": ["O-"]
};

/* ---------- STATE ---------- */
let BLOOD_BANK_STATE = JSON.parse(localStorage.getItem(BLOOD_BANK_KEY)) || {
    inventory: {},
    donors: [],
    audit: []
};

BLOOD_GROUPS.forEach(bg => {
    BLOOD_BANK_STATE.inventory[bg] ??= 0;
});

function saveState() {
    localStorage.setItem(BLOOD_BANK_KEY, JSON.stringify(BLOOD_BANK_STATE));
}

/* ---------- LOGGING ---------- */
function bbLog(message) {
    BLOOD_BANK_STATE.audit.unshift({
        message,
        time: new Date().toLocaleString()
    });
    saveState();
    renderAudit();
}

/* ---------- SERVICE (GLOBAL) ---------- */
window.BloodBankService = {

    addUnits() {
        const group = val("bb-group");
        const units = parseInt(val("bb-units"));

        if (!group || units <= 0) return alert("Invalid input");

        BLOOD_BANK_STATE.inventory[group] += units;
        bbLog(`Manual stock added: ${units} units of ${group}`);
        renderInventory();
        clearInputs();
    },

    issueUnits() {
        const group = val("bb-group");
        const units = parseInt(val("bb-units"));

        if (!group || units <= 0) return alert("Invalid input");
        if (BLOOD_BANK_STATE.inventory[group] < units)
            return alert("Insufficient stock");

        BLOOD_BANK_STATE.inventory[group] -= units;
        bbLog(`Issued ${units} units of ${group}`);

        if (BLOOD_BANK_STATE.inventory[group] <= 3) {
            suggestCompatible(group);
        }

        renderInventory();
        clearInputs();
    },

    registerDonor() {
        const name = val("donor-name").trim();
        const group = val("donor-group");
        const contact = val("donor-contact").trim();

        if (!name || !group || !/^\d{10}$/.test(contact))
            return alert("Invalid donor details");

        BLOOD_BANK_STATE.donors.push({
            id: crypto.randomUUID(),
            name,
            group,
            contact,
            lastDonation: null
        });

        bbLog(`Donor registered: ${name} (${group})`);
        saveState();
        renderDonors();
        clearInputs();
    },

    acceptDonation(id) {
        const donor = BLOOD_BANK_STATE.donors.find(d => d.id === id);
        if (!donor) return;

        if (!isEligible(donor)) {
            alert("Donor in cooldown period");
            return;
        }

        BLOOD_BANK_STATE.inventory[donor.group] += 1;
        donor.lastDonation = new Date().toISOString();

        bbLog(`Donation accepted: 1 unit of ${donor.group} from ${donor.name}`);
        saveState();
        renderInventory();
        renderDonors();
    }
};

/* ---------- ELIGIBILITY ---------- */
function isEligible(donor) {
    if (!donor.lastDonation) return true;

    const last = new Date(donor.lastDonation);
    const diffDays = (Date.now() - last) / (1000 * 60 * 60 * 24);

    return diffDays >= DONATION_COOLDOWN_DAYS;
}

/* ---------- RENDERING ---------- */
function renderInventory() {
    const c = document.getElementById("inventory-cards");
    if (!c) return;

    c.innerHTML = "";
    BLOOD_GROUPS.forEach(g => {
        const u = BLOOD_BANK_STATE.inventory[g];
        let s="success", l="Safe";

        if (u === 0) { s="secondary"; l="Out of Stock"; }
        else if (u <= 3) { s="danger"; l="Critical"; }
        else if (u <= 7) { s="warning"; l="Monitor"; }

        c.innerHTML += `
        <div class="col-md-3">
            <div class="card border-${s} text-center shadow-sm">
                <div class="card-body">
                    <h5>${g}</h5>
                    <p class="display-6 text-${s}">${u}</p>
                    <small>${l}</small>
                </div>
            </div>
        </div>`;
    });
}

function renderDonors() {
    const table = document.getElementById("donor-table");
    if (!table) return;

    table.innerHTML = "";
    BLOOD_BANK_STATE.donors.forEach(d => {
        const eligible = isEligible(d);
        table.innerHTML += `
        <tr>
            <td>${d.name}</td>
            <td>${d.group}</td>
            <td>${d.contact}</td>
            <td>
                <button class="btn btn-sm btn-${eligible ? "success":"secondary"}"
                    ${eligible ? "" : "disabled"}
                    onclick="BloodBankService.acceptDonation('${d.id}')">
                    ${eligible ? "Accept Donation":"Cooldown"}
                </button>
            </td>
        </tr>`;
    });
}

function renderAudit() {
    const list = document.getElementById("bb-audit-log");
    if (!list) return;

    list.innerHTML = "";
    BLOOD_BANK_STATE.audit.slice(0,10).forEach(a => {
        list.innerHTML += `<li>[${a.time}] ${a.message}</li>`;
    });
}

/* ---------- HELPERS ---------- */
function val(id){ return document.getElementById(id)?.value || ""; }
function clearInputs(){ document.querySelectorAll("input,select").forEach(e=>e.value=""); }

function suggestCompatible(group) {
    const compatible = COMPATIBILITY[group].join(", ");
    alert(`⚠ Low stock for ${group}\nCompatible groups: ${compatible}`);
}

/* ---------- INIT ---------- */
window.addEventListener("load", () => {
    document.getElementById("last-sync").innerText =
        new Date().toLocaleString();

    renderInventory();
    renderDonors();
    renderAudit();
});
