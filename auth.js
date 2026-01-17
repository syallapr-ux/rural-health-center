console.log("auth.js loaded");

/* =====================================================
   RURAL HEALTH CONNECT – OTP AUTH MODULE (SIMULATED)
   ===================================================== */

let CURRENT_OTP = null;
let OTP_EXPIRY = null;
let USER_MOBILE = null;

/* ---------- SEND OTP ---------- */
function sendOTP() {
    const mobile = document.getElementById("mobile")?.value;

    if (!/^[0-9]{10}$/.test(mobile)) {
        alert("Please enter a valid 10-digit mobile number");
        return;
    }

    USER_MOBILE = mobile;
    CURRENT_OTP = Math.floor(100000 + Math.random() * 900000).toString();
    OTP_EXPIRY = Date.now() + 2 * 60 * 1000; // 2 minutes

    // Show OTP in modal for demo
    document.getElementById("otpMobile").innerText = USER_MOBILE;
    document.getElementById("otpDisplay").innerText = CURRENT_OTP;
    document.getElementById("otpModal").classList.remove("d-none");

    // Switch steps
    document.getElementById("step-mobile")?.classList.add("d-none");
    document.getElementById("step-otp")?.classList.remove("d-none");
}

/* ---------- CLOSE MODAL ---------- */
function closeOtpModal() {
    document.getElementById("otpModal").classList.add("d-none");
}

/* ---------- VERIFY OTP ---------- */
function verifyOTP() {
    const enteredOTP = document.getElementById("otp")?.value;

    if (!CURRENT_OTP || !OTP_EXPIRY || Date.now() > OTP_EXPIRY) {
        alert("OTP expired. Please request again.");
        location.reload();
        return;
    }

    if (enteredOTP !== CURRENT_OTP) {
        alert("Invalid OTP");
        return;
    }

    // Save session
    localStorage.setItem("session", JSON.stringify({
        mobile: USER_MOBILE,
        role: "Citizen",
        authType: "OTP",
        loginTime: new Date().toISOString()
    }));

    alert("Login successful!");
    window.location.href = "index.html";
}

/* ---------- SESSION STATUS ---------- */
function updateSession() {
    const session = JSON.parse(localStorage.getItem("session"));
    if (session) {
        document.getElementById("sessionStatus").innerHTML = `
            Logged in as <strong>${session.mobile}</strong>
            (<span class="text-primary">${session.role}</span>)
        `;
    }
}

updateSession();
