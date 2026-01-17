// location.js

const locateBtn = document.getElementById("locateBtn");
const locationStatus = document.getElementById("locationStatus");
const healthcareResults = document.getElementById("healthcareResults");

// Function to fetch nearby healthcare centers using OpenStreetMap Nominatim API
async function fetchHealthcareCenters(lat, lon) {
    // Clear previous results
    healthcareResults.innerHTML = "";

    // OpenStreetMap Nominatim search URL
    const endpoint = `https://nominatim.openstreetmap.org/search?format=json&amenity=hospital&amenity=clinic&limit=10&lat=${lat}&lon=${lon}`;

    try {
        const response = await fetch(endpoint, {
            headers: { "User-Agent": "RuralHealthConnect/1.0" } // polite header
        });
        const data = await response.json();

        if (data.length === 0) {
            healthcareResults.innerHTML = `<p class="text-warning">No nearby healthcare centers found.</p>`;
            return;
        }

        // Show each result
        data.forEach(center => {
            const col = document.createElement("div");
            col.className = "col-md-6 col-lg-4";

            col.innerHTML = `
                <div class="card shadow-sm h-100">
                    <div class="card-body">
                        <h6 class="fw-bold">${center.display_name.split(",")[0]}</h6>
                        <p class="mb-1"><small>Type: ${center.type}</small></p>
                        <p class="mb-0"><small>Coordinates: ${center.lat}, ${center.lon}</small></p>
                    </div>
                </div>
            `;
            healthcareResults.appendChild(col);
        });
    } catch (error) {
        console.error(error);
        healthcareResults.innerHTML = `<p class="text-danger">Error fetching healthcare centers.</p>`;
    }
}

// Function to get user location
function getUserLocation() {
    locationStatus.textContent = "Detecting location...";
    healthcareResults.innerHTML = "";

    if (!navigator.geolocation) {
        locationStatus.textContent = "Geolocation is not supported by your browser.";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            locationStatus.textContent = `Your location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            fetchHealthcareCenters(latitude, longitude);
        },
        error => {
            locationStatus.textContent = "Unable to retrieve your location.";
            console.error(error);
        }
    );
}

// Event listener for the button
locateBtn.addEventListener("click", getUserLocation);
