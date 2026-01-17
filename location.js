// location.js

document.getElementById("locateBtn").addEventListener("click", () => {
    const locationStatus = document.getElementById("locationStatus");
    const resultsDiv = document.getElementById("healthcareResults");
    resultsDiv.innerHTML = "";
    locationStatus.textContent = "Detecting your location...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                locationStatus.textContent = `Your location: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;

                // Fetch nearby healthcare centers
                const query = `${lat},${lon}`;
                const radius = 5000; // in meters
                const types = ["hospital", "clinic", "pharmacy"]; // healthcare types to search

                let allCenters = [];

                for (const type of types) {
                    const url = `https://nominatim.openstreetmap.org/search?format=json&amenity=${type}&limit=10&lat=${lat}&lon=${lon}&radius=${radius}`;
                    try {
                        const response = await fetch(url, {
                            headers: {
                                "Accept-Language": "en"
                            }
                        });
                        const data = await response.json();
                        // map the results to include type
                        const mapped = data.map(item => ({
                            name: item.name || item.display_name.split(",")[0],
                            type: type,
                            lat: item.lat,
                            lon: item.lon,
                            address: item.display_name
                        }));
                        allCenters = allCenters.concat(mapped);
                    } catch (error) {
                        console.error("Error fetching data for type:", type, error);
                    }
                }

                if (allCenters.length === 0) {
                    resultsDiv.innerHTML = "<p class='text-muted'>No nearby healthcare centers found.</p>";
                    return;
                }

                // Display results
                resultsDiv.innerHTML = "";
                allCenters.forEach(center => {
                    const col = document.createElement("div");
                    col.classList.add("col-md-4");
                    col.innerHTML = `
                        <div class="card shadow-sm h-100">
                            <div class="card-body">
                                <h6 class="fw-bold">${center.name}</h6>
                                <p class="mb-1"><small>Type: ${center.type}</small></p>
                                <p class="mb-1"><small>Address: ${center.address}</small></p>
                                <p class="mb-0"><small>Coordinates: ${parseFloat(center.lat).toFixed(5)}, ${parseFloat(center.lon).toFixed(5)}</small></p>
                            </div>
                        </div>
                    `;
                    resultsDiv.appendChild(col);
                });
            },
            (error) => {
                locationStatus.textContent = "Unable to retrieve your location. Please allow location access.";
                console.error(error);
            }
        );
    } else {
        locationStatus.textContent = "Geolocation is not supported by your browser.";
    }
});
