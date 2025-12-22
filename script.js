/* script.js */

// Function to fetch and display site information
async function fetchHealthcareInfo() {
    try {
        // Fetching the JSON file from your repository
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error("Could not retrieve site information");
        }

        const data = await response.json();

        // Injecting the retrieved data into HTML elements by ID
        document.getElementById('hospital-name').innerText = data.hospitalName || "Rural Care Center";
        document.getElementById('site-status').innerText = data.status || "Check Local Center";
        document.getElementById('bed-count').innerText = data.bedsAvailable ?? "N/A";
        document.getElementById('contact').innerText = data.emergencyContact || "108";
        document.getElementById('clinic-date').innerText = data.nextClinicDate || "TBA";

        console.log("Site Information Successfully Retrieved!");

    } catch (error) {
        console.error("Error:", error);
        // Fallback UI if retrieval fails
        document.getElementById('hospital-name').innerText = "System Offline";
        document.getElementById('site-status').innerText = "Update Pending";
    }
}

// Simple function to demonstrate language support for rural populations
function changeLanguage(lang) {
    const title = document.querySelector('h1');
    const subtitle = document.querySelector('.lead');

    if (lang === 'local') {
        // Example: Telugu translation (Modify as per your specific region)
        title.innerText = "గ్రామీణ ఆరోగ్య కేంద్రం"; 
        subtitle.innerText = "మీ ఆరోగ్యం, మా ప్రాధాన్యత";
    } else {
        // Reset to English (or just reload)
        location.reload();
    }
}

// Ensure the function runs as soon as the window finishes loading
window.onload = fetchHealthcareInfo;
