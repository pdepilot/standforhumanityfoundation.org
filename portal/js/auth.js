(function (global) {
    "use strict";

    var SESSION_KEY = "sfhf_portal_session";
    var GATE_EMAIL = "info@standforhumanityfoundation.org";
    var GATE_PASSWORD = "ChangeMe2026!";

    function readSession() {
        try {
            return JSON.parse(sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY) || "null");
        } catch (e) {
            return null;
        }
    }

    function writeSession(user, remember) {
        var payload = JSON.stringify({
            email: user.email,
            name: user.name,
            role: user.role,
            signedInAt: new Date().toISOString()
        });
        sessionStorage.setItem(SESSION_KEY, payload);
        if (remember) {
            localStorage.setItem(SESSION_KEY, payload);
        } else {
            localStorage.removeItem(SESSION_KEY);
        }
    }

    function clearSession() {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_KEY);
    }

    function login(email, password, remember) {
        var cleanEmail = String(email || "").trim().toLowerCase();
        var pass = String(password || "");
        if (!cleanEmail || !pass) {
            return { ok: false, error: "Enter your email and password." };
        }
        if (cleanEmail !== GATE_EMAIL || pass !== GATE_PASSWORD) {
            return { ok: false, error: "Those details were not recognised." };
        }
        var user = {
            email: cleanEmail,
            name: "Portal",
            role: "Staff workspace"
        };
        writeSession(user, !!remember);
        return { ok: true, user: user };
    }

    function logout() {
        clearSession();
        if (global.SFHFPortalWash) {
            global.SFHFPortalWash.advance();
        }
    }

    function requireSession() {
        var session = readSession();
        if (session && session.email) return session;
        window.location.replace("login.html");
        return null;
    }

    global.SFHFPortalAuth = {
        readSession: readSession,
        login: login,
        logout: logout,
        requireSession: requireSession
    };
})(window);
