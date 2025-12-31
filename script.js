/* ======================================================
   RURAL HEALTH CONNECT – CORE ENGINE
   Author: Sri Vinay
   Purpose: Simulate ABDM-integrated rural healthcare flow
====================================================== */

async function syncFacilityData() {
    try {
        const response = await fetch("data.json");
        if (!response.ok) throw new Error("Network Error");

        const data = await response.json();

        // Bed availability (Dashboard usage)
        if (document.getElementById("bed-count")) {
            document.getElementById("bed-count").innerText =
                data.inventory.beds_available + " Beds Available";
        }

        // Timestamp update
        const timestamp = document.getElementById("current-timestamp");
        if (timestamp) {
            timestamp.innerText = "Last Sync: " + new Date().toLocaleString();
        }

        console.log("System Sync Successful:", data.facility.name);
    } catch (error) {
        console.error("Data Sync Failed:", error);
        showSystemAlert();
    }
}

function showSystemAlert() {
    alert(
        "⚠ Health Data Service Temporarily Unavailable.\nPlease try again later.\n\n(This simulates real-world API failure handling.)"
    );
}

/* Emergency SOS Simulation */
function requestAmbulance() {
    const status = document.getElementById("ambulance-status");
    status.innerHTML = `
        <span class="text-warning fw-bold">
            🚑 Dispatch Initiated... ETA: 18 Minutes
        </span>
    `;
}

/* Appointment Token Generator */
function generateToken() {
    const token = "OPD-" + Math.floor(1000 + Math.random() * 9000);
    alert("Your Appointment Token: " + token);
}

/* PWA Service Worker */
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js");
    });
}

window.onload = syncFacilityData;
setInterval(syncFacilityData, 15000);
