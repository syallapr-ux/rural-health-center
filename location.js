// ======= HEALTHCARE LOCATOR MODULE =======

const locateBtn = document.getElementById("locateBtn");
const locationStatus = document.getElementById("locationStatus");
const healthcareResults = document.getElementById("healthcareResults");

// Replace this with your own Google Places API key
const GOOGLE_API_KEY = "YOUR_GOOGLE_PLACES_API_KEY";

locateBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        locationStatus.textContent = "Geolocation is not supported by your browser.";
        return;
    }

    locationStatus.textContent = "Detecting your location...";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            locationStatus.textContent = `Location detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

            fetchNearbyHospitals(latitude, longitude);
        },
        (error) => {
            console.error(error);
            locationStatus.textContent = "Unable to get your location. Please allow location access.";
        }
    );
});

function fetchNearbyHospitals(lat, lng) {
    healthcareResults.innerHTML = "Loading nearby healthcare centers...";

    // Google Places Nearby Search API endpoint
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=hospital&key=${GOOGLE_API_KEY}`;

    // We cannot call Google Places API directly from frontend due to CORS.
    // For demo purposes, you can either:
    // 1. Use a free proxy like https://cors-anywhere.herokuapp.com/
    // 2. Or just simulate data for the interview/demo.

    fetch(`https://cors-anywhere.herokuapp.com/${url}`)
        .then((res) => res.json())
        .then((data) => {
            healthcareResults.innerHTML = "";
            if (!data.results || data.results.length === 0) {
                healthcareResults.textContent = "No nearby healthcare centers found.";
                return;
            }

            data.results.slice(0, 5).forEach((place) => {
                const card = document.createElement("div");
                card.className = "col-md-6";

                card.innerHTML = `
                    <div class="card shadow-sm p-3">
                        <h5 class="fw-bold">${place.name}</h5>
                        <p class="mb-1">${place.vicinity || "Address not available"}</p>
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}" target="_blank" class="btn btn-sm btn-outline-primary">View on Map</a>
                    </div>
                `;
                healthcareResults.appendChild(card);
            });
        })
        .catch((err) => {
            console.error(err);
            healthcareResults.textContent = "Failed to fetch healthcare centers. Please try again later.";
        });
}
