async function loadHealthcareData() {
  try {
    // 1. Fetch the data from your JSON file
    const response = await fetch('data.json');
    const data = await response.json();

    // 2. Inject the data into your HTML elements
    document.getElementById('hospital-name').innerText = data.hospitalName;
    document.getElementById('site-status').innerText = data.status;
    document.getElementById('bed-count').innerText = data.bedsAvailable;
    document.getElementById('contact').innerText = data.emergencyContact;
    document.getElementById('clinic-date').innerText = data.nextClinicDate;

  } catch (error) {
    console.error("Error retrieving site information:", error);
  }
}

// Run the function when the page loads
window.onload = loadHealthcareData;
