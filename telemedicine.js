/* =====================================================
   TELEMEDICINE MODULE – INTERVIEW READY VERSION
===================================================== */

/* ---------- ELEMENT REFERENCES ---------- */
const abhaInput = document.getElementById("abhaId");
const mobileInput = document.getElementById("mobileNumber");
const verifyBtn = document.getElementById("verifyBtn");

const abhaError = document.getElementById("abhaError");
const mobileError = document.getElementById("mobileError");
const verifySuccess = document.getElementById("verifySuccess");

const slotPanel = document.getElementById("slotPanel");
const slotSelect = document.getElementById("slotSelect");
const slotError = document.getElementById("slotError");

const consultationPanel = document.getElementById("consultationPanel");
const consultNotes = document.getElementById("consultNotes");
const notesPreview = document.getElementById("notesPreview");
const saveMsg = document.getElementById("saveMsg");

const timerEl = document.getElementById("consultTimer");
const activeSlotEl = document.getElementById("activeSlot");

/* ---------- STATE ---------- */
let sessionStartTime = null;
let timerInterval = null;
let idleTimeout = null;

let slots = [
    { time: "09:00 - 09:15", booked: false },
    { time: "09:15 - 09:30", booked: false },
    { time: "10:00 - 10:15", booked: false },
    { time: "10:15 - 10:30", booked: true }
];

/* ---------- VALIDATION ---------- */
function isValidABHA(v) {
    return /^[a-zA-Z0-9._-]+@abdm$/.test(v);
}
function isValidMobile(v) {
    return /^\d{10}$/.test(v);
}

function validateInputs() {
    const abha = abhaInput.value.trim();
    const mobile = mobileInput.value.trim();

    abhaError.innerText = "";
    mobileError.innerText = "";

    let valid = true;

    if (!isValidABHA(abha)) {
        abhaError.innerText = "Enter valid ABHA ID (example@abdm)";
        abhaInput.classList.add("is-invalid");
        valid = false;
    } else {
        abhaInput.classList.remove("is-invalid");
        abhaInput.classList.add("is-valid");
    }

    if (!isValidMobile(mobile)) {
        mobileError.innerText = "Enter valid 10-digit mobile number";
        mobileInput.classList.add("is-invalid");
        valid = false;
    } else {
        mobileInput.classList.remove("is-invalid");
        mobileInput.classList.add("is-valid");
    }

    verifyBtn.disabled = !valid;
}

abhaInput.addEventListener("input", validateInputs);
mobileInput.addEventListener("input", validateInputs);

/* ---------- SESSION START ---------- */
function startSession() {

    // Reset validation UI
    verifySuccess.innerText = "";
    abhaInput.classList.remove("is-valid");
    mobileInput.classList.remove("is-valid");

    localStorage.setItem("telemed_patient", JSON.stringify({
        abhaId: abhaInput.value.trim(),
        mobile: mobileInput.value.trim(),
        verifiedAt: new Date().toISOString()
    }));

    verifySuccess.innerText = "Verification successful. Select a slot.";

    renderSlots();
    slotPanel.classList.remove("hidden");
    slotPanel.classList.add("visible");

    startIdleTimer();
}

/* ---------- SLOT RENDER ---------- */
function renderSlots() {
    slotSelect.innerHTML = `<option value="">-- Select Slot --</option>`;

    slots.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.time;
        opt.textContent = s.booked ? `${s.time} (Booked)` : s.time;
        opt.disabled = s.booked;
        slotSelect.appendChild(opt);
    });
}

slotSelect.addEventListener("change", () => {
    slotSelect.classList.remove("is-invalid");
    slotSelect.style.borderColor = "green";
});

/* ---------- ENTER CONSULTATION ---------- */
function enterConsultation() {

    if (!slotSelect.value) {
        slotError.innerText = "Please select a consultation slot.";
        slotSelect.classList.add("is-invalid");
        return;
    }

    slotError.innerText = "";
    slotSelect.classList.remove("is-invalid");

    const selectedSlot = slotSelect.value;
    const idx = slots.findIndex(s => s.time === selectedSlot);
    if (idx !== -1) slots[idx].booked = true;

    renderSlots();

    localStorage.setItem("telemed_slot", selectedSlot);
    activeSlotEl.innerText = `Slot: ${selectedSlot}`;

    consultationPanel.classList.remove("hidden");
    consultationPanel.classList.add("visible");

    sessionStartTime = new Date();
    timerEl.innerText = "00:00";
    startTimer();
}

/* ---------- TIMER ---------- */
function startTimer() {
    timerInterval = setInterval(() => {
        const diff = Math.floor((new Date() - sessionStartTime) / 1000);
        const m = String(Math.floor(diff / 60)).padStart(2, "0");
        const s = String(diff % 60).padStart(2, "0");
        timerEl.innerText = `${m}:${s}`;
    }, 1000);
}

/* ---------- NOTES PREVIEW ---------- */
consultNotes.addEventListener("input", () => {
    const formatted = consultNotes.value
        .replace(/\n/g, "<br>")
        .replace(/\*([^*]+)\*/g, "<strong>$1</strong>");

    notesPreview.innerHTML = consultNotes.value
        ? `Notes Preview:<br>${formatted}`
        : "";
});

/* ---------- SAVE CONSULTATION ---------- */
function saveConsultation() {

    if (!consultNotes.value.trim()) {
        saveMsg.className = "text-danger";
        saveMsg.innerText = "Consultation notes cannot be empty.";
        return;
    }

    const id = Date.now();

    const record = {
        id,
        patient: JSON.parse(localStorage.getItem("telemed_patient")),
        slot: localStorage.getItem("telemed_slot"),
        notes: consultNotes.value.trim(),
        savedAt: new Date().toLocaleString()
    };

    localStorage.setItem(`consultation_${id}`, JSON.stringify(record));

    saveMsg.className = "text-success";
    saveMsg.innerText = `Consultation saved at ${record.savedAt}`;
}

/* ---------- END CONSULTATION ---------- */
function endConsultation() {

    if (!confirm("Are you sure you want to end the consultation?")) return;

    clearInterval(timerInterval);
    clearTimeout(idleTimeout);

    timerEl.innerText = "00:00";
    saveMsg.innerText = "";
    notesPreview.innerHTML = "";
    consultNotes.value = "";

    consultationPanel.classList.remove("visible");
    consultationPanel.classList.add("hidden");

    slotPanel.classList.remove("visible");
    slotPanel.classList.add("hidden");

    slotSelect.value = "";
    slotSelect.style.borderColor = "";

    localStorage.removeItem("telemed_patient");
    localStorage.removeItem("telemed_slot");

    alert("Consultation ended successfully.");
}

/* ---------- IDLE TIMEOUT ---------- */
function startIdleTimer() {
    idleTimeout = setTimeout(() => {
        alert("Session expired due to inactivity.");
        endConsultation();
    }, 1800000); // 30 minutes
}
