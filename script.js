// 1. Dynamic Health Camp Scheduling
const updateHealthCamps = () => {
    const campDate = document.getElementById('clinic-date');
    if(campDate) {
        let nextCamp = new Date();
        nextCamp.setDate(nextCamp.getDate() + (7 - nextCamp.getDay()) % 7 + 1); // Next Monday
        campDate.innerText = "Next Village Drive: " + nextCamp.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
};

// 2. Real-Time Bed Availability Logic
const updateBeds = () => {
    const bedEl = document.getElementById('bed-count');
    if(bedEl) {
        // Simulates real database fluctuation
        let count = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
        bedEl.innerText = count;
        bedEl.style.color = count < 6 ? "#dc3545" : "#0d6efd";
    }
};

// 3. Language Translation Logic (Simplified)
const changeLanguage = (lang) => {
    const hospitalName = document.getElementById('hospital-name');
    if(lang === 'local') {
        hospitalName.innerText = "గ్రామీణ ఆరోగ్య కేంద్రం (Rural Health Center)";
        alert("Language switched to Telugu. Navigating to localized content...");
    }
};

// Run on load
window.onload = () => {
    updateHealthCamps();
    setInterval(updateBeds, 5000); // Update beds every 5 seconds
};
