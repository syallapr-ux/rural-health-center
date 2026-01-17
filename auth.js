console.log("auth.js loaded");

/* =====================================================
   RURAL HEALTH CONNECT – EMAIL OTP AUTH MODULE
   ===================================================== */

let CURRENT_OTP = null;
let OTP_EXPIRY = null;
let USER_EMAIL = null;

/* ---------- SEND OTP ---------- */
function sendOTP() {
    const emailInput = document.getElementById("email")?.value.trim();

    // Validate email
    if (!/^\S+@\S+\.\S+$/.test(emailInput)) {
        alert("Please enter a valid email address");
        return;
    }

    USER_EMAIL = emailInput;

    // Generate 6-digit OTP
    CURRENT_OTP = Math.floor(100000 + Math.random() * 900000).toString();
    OTP_EXPIRY = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    // Prepare template parameters for EmailJS
    const templateParams = {
        user_email: USER_EMAIL,
        otp_code: CURRENT_OTP
    };

    // Send OTP using EmailJS
    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", templateParams, "YOUR_PUBLIC_KEY")
        .then(() => {
            alert("OTP sent successfully to your email!");
            console.log(`Generated OTP for demo: ${CURRENT_OTP}`); // For your debugging/demo only

            // Show OTP input, hide email input
            document.getElementById("step-email")?.classList.add("d-none");
            document.getElementById("step-otp")?.classList.remove("d-none");
        })
        .catch((err) => {
            console.error("Error sending OTP:", err);
            alert("Failed to send OTP. Please try again later.");
        });
}

/* ---------- VERIFY OTP ---------- */
function verifyOTP() {
    const enteredOTP = document.getElementById("otp")?.value.trim();

    if (!CURRENT_OTP || !OTP_EXPIRY) {
        alert("Session expired. Please request OTP again.");
        location.reload();
        return;
    }

    // Check if OTP expired
    if (Date.now() > OTP_EXPIRY) {
        alert("OTP expired. Please request a new one.");
        location.reload();
        return;
    }

    // Validate OTP
    if (enteredOTP !== CURRENT_OTP) {
        alert("Invalid OTP. Please try again.");
        return;
    }

    // OTP correct → Save session
    localStorage.setItem("session", JSON.stringify({
        email: USER_EMAIL,
        role: "Citizen",
        authType: "OTP",
        loginTime: new Date().toISOString()
    }));

    alert("Authentication successful!");
    updateSession();
    window.location.href = "index.html";
}

/* ---------- UPDATE SESSION STATUS ---------- */
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
