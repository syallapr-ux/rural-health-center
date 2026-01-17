console.log("auth.js loaded - EmailJS OTP Module");

/* =====================================================
   RURAL HEALTH CONNECT – OTP AUTH MODULE (EMAILJS)
   ===================================================== */

let CURRENT_OTP = null;
let OTP_EXPIRY = null;
let USER_MOBILE = null;

/* ---------- CONFIGURATION ---------- */
const EMAILJS_SERVICE_ID = "-FqUhIyfPk3fcjG2r";    // from EmailJS dashboard
const EMAILJS_TEMPLATE_ID = "template_cvq0hfg"; // from template details
const EMAILJS_PUBLIC_KEY  = "your_public_key";  // from EmailJS dashboard

/* ---------- SEND OTP ---------- */
function sendOTP() {
    const mobile = document.getElementById("mobile")?.value;

    if (!/^[0-9]{10}$/.test(mobile)) {
        alert("Please enter a valid 10-digit mobile number");
        return;
    }

    USER_MOBILE = mobile;
    CURRENT_OTP = Math.floor(100000 + Math.random() * 900000).toString();
    OTP_EXPIRY = Date.now() + 15 * 60 * 1000; // 15 minutes

    console.log("Generated OTP (demo):", CURRENT_OTP);

    // Prepare email parameters
    const templateParams = {
        user_mobile: USER_MOBILE,
        otp_code: CURRENT_OTP
    };

    // Send email using EmailJS
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
        .then(() => {
            alert("OTP sent successfully to your email!");
            document.getElementById("step-mobile")?.classList.add("d-none");
            document.getElementById("step-otp")?.classList.remove("d-none");
        })
        .catch((error) => {
            console.error("EmailJS error:", error);
            alert("Failed to send OTP. Please try again later.");
        });
}

/* ---------- VERIFY OTP ---------- */
function verifyOTP() {
    const enteredOTP = document.getElementById("otp")?.value;

    if (!CURRENT_OTP || !OTP_EXPIRY || Date.now() > OTP_EXPIRY) {
        alert("OTP expired. Please request a new one.");
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
        authType: "EmailOTP",
        loginTime: new Date().toISOString()
    }));

    alert("Authentication successful!");
    window.location.href = "index.html";
}

/* ---------- SESSION DISPLAY ---------- */
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
