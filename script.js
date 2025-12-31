/* =====================================================
   RURAL HEALTH CONNECT – CORE ENGINE
   Frontend Architecture for Healthcare Information System
   ===================================================== */

/* ---------------- GLOBAL STATE ---------------- */
let FACILITY_DATA = null;

/* ---------------- DATA SYNC ---------------- */
async function syncFacilityData() {
    try {
        const res = await fetch('data.json');
        if (!res.ok) throw new Error("Data fetch failed");

        FACILITY_DATA = await res.json();
        bindGlobalData();
        console.log("System Synced:", FACILITY_DATA.facility.name);

    } catch (error) {
        console.error("System Sync Error:", error);
        showSystemAlert("Offline Mode: Showing last available data");
    }
}

/* ---------------- DATA BINDING ---------------- */
function bindGlobalData() {
    if (!FACILITY_DATA) return;

    // Bed Availability
    const bedEl = document.getElementById('bed-count');
    if (bedEl) bedEl.innerText = FACILITY_DATA.inventory.beds_available;

    // Blood Bank Summary
    const bloodEl = document.getElementById('blood-summary');
    if (bloodEl && FACILITY_DATA.blood_bank) {
        bloodEl.innerText = Object.keys(FACILITY_DATA.blood_bank).length + " Groups Available";
    }
}

/* ---------------- SHARED LAYOUT ---------------- */
function injectLayout() {
    const headerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow">
        <div class="container">
            <a class="navbar-brand fw-bold" href="index.html">
                <i class="fa-solid fa-house-medical"></i> RH-CONNECT
            </a>
            <button class="btn btn-danger btn-sm" onclick="activateEmergencyMode()">
                <i class="fa-solid fa-triangle-exclamation"></i> Emergency
            </button>
        </div>
    </nav>
    `;

    const footerHTML = `
    <footer class="bg-dark text-white py-4 mt-5">
        <div class="container text-center">
            <small>Ayushman Bharat Digital Mission | NHM | Rural Health Initiative</small>
        </div>
    </footer>
    `;

    if (!document.querySelector('nav')) {
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }
    if (!document.querySelector('footer')) {
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
}

/* ---------------- EMERGENCY MODE ---------------- */
function activateEmergencyMode() {
    document.body.innerHTML = `
    <div class="container text-center py-5">
        <h1 class="text-danger fw-bold">EMERGENCY MODE ACTIVATED</h1>
        <p class="lead">Immediate assistance information</p>

        <div class="card p-4 shadow mt-4">
            <h3>Emergency Numbers</h3>
            <p class="fs-4 fw-bold text-danger">108 / 104</p>

            <h5 class="mt-3">Nearest Facility</h5>
            <p>${FACILITY_DATA?.facility?.name || "District Hospital"}</p>

            <a href="ambulance.html" class="btn btn-danger mt-3">
                Request Ambulance
            </a>
        </div>
    </div>
    `;
}

/* ---------------- PAGE ROUTER ---------------- */
function initPageLogic() {
    const page = window.location.pathname;

    if (page.includes("blood-bank")) initBloodBankPage();
    if (page.includes("ambulance")) initAmbulancePage();
    if (page.includes("appointments")) initAppointmentsPage();
}

/* ---------------- PAGE MODULES ---------------- */
function initBloodBankPage() {
    if (!FACILITY_DATA || !FACILITY_DATA.blood_bank) return;

    const container = document.getElementById("blood-container");
    if (!container) return;

    let html = `<h2 class="mb-4">Blood Availability</h2><div class="row">`;

    Object.entries(FACILITY_DATA.blood_bank).forEach(([group, units]) => {
        html += `
        <div class="col-md-3 mb-3">
            <div class="card text-center p-3 shadow-sm">
                <h4>${group}</h4>
                <p class="fw-bold">${units} Units</p>
            </div>
        </div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function initAmbulancePage() {
    console.log("Ambulance Module Loaded");
}

function initAppointmentsPage() {
    console.log("Appointments Module Loaded");
}

/* ---------------- SYSTEM ALERT ---------------- */
function showSystemAlert(message) {
    const alert = document.createElement("div");
    alert.className = "alert alert-warning text-center";
    alert.innerText = message;
    document.body.prepend(alert);
}

/* ---------------- PWA SUPPORT ---------------- */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js');
        console.log("Service Worker Registered");
    });
}

/* ---------------- INIT ---------------- */
window.addEventListener("DOMContentLoaded", () => {
    injectLayout();
    syncFacilityData();
    initPageLogic();
    setInterval(syncFacilityData, 15000);
});
