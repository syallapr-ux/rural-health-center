/**
 * RURAL HEALTH CONNECT - CORE ENGINE
 * Features: Live Polling, Simulated RBAC, PWA Support
 */

const APP_DATA = {
    syncRate: 10000, // 10 seconds
    bedEndpoint: './data.json',
    isDoctor: false
};

// 1. DATA RETRIEVAL LOGIC (Information Retrieval Simulation)
async function fetchHospitalMetrics() {
    try {
        const response = await fetch(APP_DATA.bedEndpoint);
        const data = await response.json();
        
        // Update DOM with Data Validation
        updateElement('bed-count', data.beds || "Updating...");
        updateElement('site-status', data.status || "Checking...");
        
        // Logical UI: Change color if beds are low
        const bedDisplay = document.getElementById('bed-count');
        if(data.beds < 5) bedDisplay.classList.add('text-danger');
        else bedDisplay.classList.remove('text-danger');

    } catch (err) {
        console.warn("Retriever Error: Using Fail-safe Local Data.");
        // Static fallback if API fails
        updateElement('bed-count', "12");
    }
}

// 2. ROLE-BASED ACCESS CONTROL (RBAC) SIMULATION
function simulateLogin() {
    const pin = prompt("Enter Practitioner PIN (Try: 1234):");
    if(pin === "1234") {
        APP_DATA.isDoctor = true;
        document.body.classList.add('admin-mode');
        alert("Authenticated: Access to Patient EMR Enabled.");
        // Redirect to a specific diagnostic view
        window.location.href = "#status";
    } else {
        alert("Invalid PIN. Access Denied.");
    }
}

// 3. UTILITY FUNCTIONS
function updateElement(id, value) {
    const el = document.getElementById(id);
    if(el) el.innerText = value;
}

// 4. SERVICE WORKER REGISTRATION (PWA Logic for Offline Access)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('PWA Offline Cache Active'))
            .catch(err => console.log('PWA Init Failed', err));
    });
}

// Initialize
setInterval(fetchHospitalMetrics, APP_DATA.syncRate);
fetchHospitalMetrics();
