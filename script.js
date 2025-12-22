async function fetchHealthcareInfo() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();

        // Initial injection
        updateUI(data);

        // Simulate "Live" updates every 5 seconds
        setInterval(() => {
            // Randomly fluctuate beds by +/- 1 or 2
            const fluctuation = Math.floor(Math.random() * 3) - 1; 
            const newBedCount = Math.max(0, data.bedsAvailable + fluctuation);
            document.getElementById('bed-count').innerText = newBedCount;
            
            // Randomly toggle facility status for demo
            const statuses = ["Open 24/7", "Emergency Only", "Busy", "Open 24/7"];
            document.getElementById('site-status').innerText = statuses[Math.floor(Math.random() * statuses.length)];
        }, 5000);

    } catch (error) {
        console.error("Error retrieving site information:", error);
    }
}

function updateUI(data) {
    document.getElementById('hospital-name').innerText = data.hospitalName;
    document.getElementById('site-status').innerText = data.status;
    document.getElementById('bed-count').innerText = data.bedsAvailable;
    document.getElementById('contact').innerText = data.emergencyContact;
    document.getElementById('clinic-date').innerText = data.nextClinicDate;
}

function changeLanguage(lang) {
    if(lang === 'local') {
        document.querySelector('h1').innerText = "గ్రామీణ ఆరోగ్య కేంద్రం";
    } else {
        location.reload();
    }
}

window.onload = fetchHealthcareInfo;
