// ================= CORE DATA ENGINE =================
async function syncFacilityData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();

        // Beds
        const bedEl = document.getElementById('bed-count');
        if (bedEl) bedEl.innerText = data.inventory.beds_available;

        // Oxygen
        const oxyEl = document.getElementById('oxygen-status');
        if (oxyEl) oxyEl.innerText = data.inventory.oxygen_status;

        console.log("Facility data synced successfully");

    } catch (error) {
        console.error("Data sync failed", error);
    }
}

// ================= SERVICE WORKER =================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log("Service Worker Registered"))
            .catch(err => console.error("SW failed", err));
    });
}

// ================= INIT =================
window.onload = () => {
    syncFacilityData();
    setInterval(syncFacilityData, 15000);
};
