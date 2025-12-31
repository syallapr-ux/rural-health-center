/**
 * RURAL HEALTH CONNECT - CORE LOGIC
 * Interacts with real-time JSON and handles System-Level Updates
 */

// Global App State
const state = {
    data: null,
    syncInterval: 10000 // 10s for TCS Demo
};

// 1. Initial Data Fetch (Information Retrieval)
async function initializeHealthPortal() {
    try {
        const response = await fetch('./data.json');
        state.data = await response.json();
        
        console.log("System Synced with Facility: " + state.data.facility_metadata.hospital_id);
        
        updateUI();
        startLiveSync();
    } catch (error) {
        console.error("Critical Sync Failure: Check data.json integrity.");
    }
}

// 2. DOM Binding (Real Data Only)
function updateUI() {
    if(!state.data) return;

    // Bed Availability Update
    const bedEl = document.getElementById('bed-count');
    if(bedEl) {
        bedEl.innerText = state.data.live_inventory.beds.available;
        // Dynamic styling for low stock
        if(state.data.live_inventory.beds.available < 5) {
            bedEl.style.color = "#dc3545";
        }
    }

    // Site Status Update
    const statusEl = document.getElementById('site-status');
    if(statusEl) statusEl.innerText = state.data.facility_metadata.accreditation;
}

// 3. Live Polling Simulation (Advanced Technical Implementation)
function startLiveSync() {
    setInterval(async () => {
        try {
            const response = await fetch('./data.json');
            state.data = await response.json();
            updateUI();
        } catch (e) {
            console.log("Polling Interrupted.");
        }
    }, state.syncInterval);
}

// Start System
window.onload = initializeHealthPortal;
