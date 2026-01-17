console.log("auth.js loaded");

/* =====================================================
   RURAL HEALTH CONNECT – OTP AUTH MODULE (EmailJS)
   ===================================================== */

let CURRENT_OTP = null;
let OTP_EXPIRY = null;
let USER_EMAIL = null;

/* ---------- SEND OTP ---------- */
function sendOTP() {
    const email = document.getElementById("email")?.value;

    // Basic email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        alert("Please enter a valid email address");
        return;
    }

    USER_EMAIL = email;
    CURRENT_OTP = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    OTP_EXPIRY = Date.now() + 2 * 60 * 1000; // valid for 2 minutes

    // Prepare EmailJS template params
    const templateParams = {
        user_email: USER_EMAIL,
        otp_code: CURRENT_OTP
    };

    // Send OTP via EmailJS
    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", templateParams, "YOUR_PUBLIC_KEY")
        .then(() => {
            alert("OTP sent successfully to " + USER_EMAIL);
            // Show OTP input step
            document.getElementById("step-email").classList.add("d-none");
            document.getElementById("step-otp").classList.remove("d-none");
        })
        .catch((err) => {
            console.error("EmailJS error:", err);
            alert("Failed to send OTP. Please try again.");
        });

    console.log("Generated OTP (demo):", CURRENT_OTP);
}

/* ---------- VERIFY OTP ---------- */
function verifyOTP() {
    const enteredOTP = document.getElementById("otp")?.value;

    if (!CURRENT_OTP || !OTP_EXPIRY) {
        alert("Session expired. Request a new OTP.");
        location.reload();
        return;
    }

    if (Date.now() > OTP_EXPIRY) {
        alert("OTP expired. Request a new one.");
        location.reload();
        return;
    }

    if (parseInt(enteredOTP, 10) !== CURRENT_OTP) {
        alert("Invalid OTP");
        return;
    }

    // Save session
    localStorage.setItem("session", JSON.stringify({
        email: USER_EMAIL,
        role: "Citizen",
        authType: "OTP",
        loginTime: new Date().toISOString()
    }));

    alert("Login successful!");
    window.location.href = "index.html";
}

/* ---------- UPDATE SESSION DISPLAY ---------- */
function updateSession() {
    const session = JSON.parse(localStorage.getItem("session"));
    if (session) {
        document.getElementById("sessionStatus").innerHTML = `
            Logged in as <strong>${session.email}</strong>
            (<span class="text-primary">${session.role}</span>)
        `;
    }
}

updateSession();
