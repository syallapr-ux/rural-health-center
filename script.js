// IRHIS Core Engine
async function syncFacilityData() {
    try {
        const res = await fetch('data.json');
        const data = await res.json();
        
        // Data Binding
        if(document.getElementById('bed-count')) {
            document.getElementById('bed-count').innerText = data.inventory.beds_available;
        }
        console.log("System Synced: " + data.facility.name);
    } catch (e) {
        console.error("Sync Error");
    }
}

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js');
    });
}

window.onload = syncFacilityData;
setInterval(syncFacilityData, 10000);
