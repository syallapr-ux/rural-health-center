console.log("auth.js loaded");

/* =====================================================
   RURAL HEALTH CONNECT – OTP AUTH MODULE (DEMO)
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
    CURRENT_OTP = Math.floor(100000 + Math.random() * 900000);
    OTP_EXPIRY = Date.now() + 2 * 60 * 1000; // 2 minutes

    console.log("Generated OTP (demo mode):", CURRENT_OTP);

    alert("OTP sent successfully (demo mode)");

    document.getElementById("step-mobile")?.classList.add("d-none");
    document.getElementById("step-otp")?.classList.remove("d-none");
}

/* ---------- VERIFY OTP ---------- */
function verifyOTP() {
    const enteredOTP = document.getElementById("otp")?.value;

    if (!CURRENT_OTP || !OTP_EXPIRY) {
        alert("Session expired. Please request OTP again.");
        location.reload();
        return;
    }

    if (Date.now() > OTP_EXPIRY) {
        alert("OTP expired. Please request a new one.");
        location.reload();
        return;
    }

    if (parseInt(enteredOTP, 10) !== CURRENT_OTP) {
        alert("Invalid OTP");
        return;
    }

    /* ---------- SAVE SESSION ---------- */
    localStorage.setItem("session", JSON.stringify({
        mobile: USER_MOBILE,
        role: "Citizen",
        authType: "OTP",
        loginTime: new Date().toISOString()
    }));

    alert("Authentication successful");
    window.location.href = "index.html";
}
