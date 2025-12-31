// Core Data Sync
async function syncFacilityData() {
  try {
    const res = await fetch("data.json");
    const data = await res.json();

    if (document.getElementById("bed-count")) {
      document.getElementById("bed-count").innerText =
        data.inventory.beds_available;
    }
  } catch (e) {
    console.error("Data sync failed");
  }
}

// Load Navbar & Footer
async function loadLayout() {
  const nav = await fetch("navbar.html").then(r => r.text());
  const foot = await fetch("footer.html").then(r => r.text());

  document.getElementById("navbar-placeholder").innerHTML = nav;
  document.getElementById("footer-placeholder").innerHTML = foot;
}

window.addEventListener("DOMContentLoaded", () => {
  syncFacilityData();
  loadLayout();
});

// PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
