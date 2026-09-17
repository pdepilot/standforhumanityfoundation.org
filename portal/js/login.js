(function () {
    "use strict";

    var visual = document.getElementById("loginVisual");
    if (window.SFHFPortalWash) {
        SFHFPortalWash.apply(visual);
    }
    if (visual && /from=logout/.test(location.search)) {
        visual.classList.add("from-logout");
    }

    if (window.SFHFPortalAuth && SFHFPortalAuth.readSession()) {
        window.location.replace("dashboard.html");
        return;
    }

    var form = document.getElementById("portalLoginForm");
    var alertBox = document.getElementById("loginAlert");
    var submitBtn = document.getElementById("loginSubmit");
    var toggle = document.getElementById("togglePassword");
    var password = document.getElementById("password");
    var remember = document.querySelector('input[name="remember"]');

    if (toggle && password) {
        toggle.addEventListener("click", function () {
            var hidden = password.getAttribute("type") === "password";
            password.setAttribute("type", hidden ? "text" : "password");
            toggle.setAttribute("aria-label", hidden ? "Hide password" : "Show password");
            toggle.innerHTML = hidden ? '<i class="fa fa-eye-slash"></i>' : '<i class="fa fa-eye"></i>';
        });
    }

    function showError(message) {
        if (!alertBox) return;
        alertBox.textContent = message;
        alertBox.classList.add("show");
    }

    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (alertBox) alertBox.classList.remove("show");
        var email = document.getElementById("email").value.trim();
        var pass = password.value;
        var result = SFHFPortalAuth.login(email, pass, !!(remember && remember.checked));
        if (!result.ok) {
            showError(result.error);
            return;
        }
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Entering…";
        }
        window.location.href = "dashboard.html";
    });
})();
