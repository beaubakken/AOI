document.addEventListener("DOMContentLoaded", () => {

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    //const passwordSection = document.getElementById("passwordSection");
    const checkEmailBtn = document.getElementById("checkEmailBtn");
    const loginBtn = document.getElementById("loginBtn");
    const emailError = document.getElementById("emailError");
    //const passwordError = document.getElementById("passwordError");

    // Reset UI when typing in email
    emailInput.addEventListener("input", () => {
        hidePasswordSection();
        emailError.textContent = "";
    });

    // Enter on email → check email
    emailInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            checkUserLogin();
        }
    });

    // Enter on password → login
    passwordInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            checkUserPassword();
        }
    });

    // Button clicks
    checkEmailBtn.addEventListener("click", checkUserLogin);
    loginBtn.addEventListener("click", checkUserPassword);

});


function showPasswordSection() {
    document.getElementById("passwordSection").classList.remove("hidden");
    document.getElementById("checkEmailBtn").classList.add("hidden");
}

function hidePasswordSection() {
    document.getElementById("passwordSection").classList.add("hidden");
    document.getElementById("checkEmailBtn").classList.remove("hidden");
    document.getElementById("password").value = "";
    document.getElementById("passwordError").textContent = "";
}

async function checkUserLogin() {

    const email = document.getElementById("email").value.trim();
    const emailError = document.getElementById("emailError");

    emailError.textContent = "";

    if (!email) {
        emailError.textContent = "Please enter an email.";
        return;
    }

    const usrCheck = await checkUserAccount(email);

    if (!usrCheck.pass) {
        emailError.textContent = usrCheck.message;
        return;
    }

    showPasswordSection();
    document.getElementById("password").focus();
}


async function checkUserAccount(email) {
    showSpinnerWithTimeout();

    try {
        const params = new URLSearchParams({ emailAddr: email, accountRequest: "0" });

        const response = await fetch(`/apps/UX/CheckUserAccount?${params.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        });

        const retObj = await response.json();
        hideSpinner();

        return {
            pass: retObj.canadvance,
            message: retObj.error
        };

    } catch (error) {
        hideSpinner();
        return {
            pass: false,
            message: "An unexpected error occurred."
        };
    }
}

async function checkUserPassword() {
    showSpinnerWithTimeout();
    var email = document.getElementById("email").value.trim();
    var pwd = document.getElementById("password").value.trim();
    const passwordError = document.getElementById("passwordError");
    const strURL = document.getElementById("hfMainLogin_RequestURL").value;

    passwordError.textContent = "";

    if (!email) {
        passwordError.textContent = "Please enter an email.";
        return;
    }
    if (!pwd) {
        passwordError.textContent = "Please enter a password.";
        return;
    }

    try {
        const response = await fetch("/apps/UX/RunUserLogin", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: new URLSearchParams({
                email: email,
                password: pwd,
                requesturl: strURL,
                ipaddr: '',
                msec: ''
            })
        });

        const resp = await response.json();
        hideSpinner();
        //Status:  1 - Success,  2 - Warning,  3 - Error,  4 - Change Password, 5 - Set Security Questions, 6 - Display EULA, 7 - Verify (MFA), 8 - Check (MFA)
        if (resp.status === 1) {
            window.location.href = GetAbsoluteURL(resp.returnurl);
            return;
        }

        if (resp.status === 4) {
            window.location.href = "/user-profile/pwd-update";
            return;
        }

        if (resp.status === 3) {
            //document.getElementById("trMainLogin_SpecifyCredentials_Error").style.display = "";
            //document.getElementById("msgMainLogin_SpecifyCredentials_Error").innerHTML =
            //    escapeHtml(resp.error);
            passwordError.textContent = resp.error;
            return;
        }

         if (resp.status === 7) {
            // Hide login sections
        //    document.getElementById("divMainLogin_SpecifyUser").style.display = "none";
        //    document.getElementById("divMainLogin_SpecifyCredentials").style.display = "none";
        //    document.getElementById("divMainLogin_MFA").style.display = "";

        //    // Set MFA user ID
        //    document.getElementById("hfMainLogin_UID").value = resp.user.id;

        //    // Email
        //    document.getElementById("tdMainLogin_MFA_Email").innerHTML =
        //        "<b>" + escapeHtml(resp.user.email) + "</b>";

        //    // Message
        //    if (resp.error.length > 0) {
        //        document.getElementById("tdMainLogin_MFA_Message").innerHTML =
        //            `<div class="message-field error">${escapeHtml(resp.error)}</div>`;
        //    } else {
        //        document.getElementById("tdMainLogin_MFA_Message").innerHTML =
        //            `<div class="message-field success">${escapeHtml(resp.warning)}</div>`;
        //    }
        }

    } catch (err) {
        passwordError.textContent = err;
        hideSpinner();
    }
}



