(function () {
    "use strict";

    var session = window.SFHFPortalAuth ? SFHFPortalAuth.requireSession() : null;
    if (!session) return;

    var theme = window.SFHFPortalWash ? SFHFPortalWash.current() : null;
    if (theme) {
        document.body.style.setProperty("--wash", theme.wash);
        document.body.style.setProperty("--wash-soft", theme.soft);
        document.body.style.setProperty("--accent", theme.accent);
        document.body.style.setProperty("--type-photo", "url('" + theme.image + "')");
    }

    var nameEl = document.getElementById("dashName");
    var roleEl = document.getElementById("dashRole");
    var greetEl = document.getElementById("dashGreet");
    if (nameEl) nameEl.textContent = session.name || "Portal";
    if (roleEl) roleEl.textContent = session.role || "Staff workspace";
    if (greetEl) greetEl.textContent = "The stand is open";

    var rule = document.getElementById("typeRule");
    if (rule && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.addEventListener("mousemove", function (e) {
            rule.style.transform = "translateY(" + e.clientY + "px)";
        }, { passive: true });
    }

    function tickClock() {
        var el = document.getElementById("dashClock");
        if (!el) return;
        var now = new Date();
        el.textContent = now.toLocaleString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    function formatMoney(amount, currency) {
        try {
            return new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: currency || "NGN",
                maximumFractionDigits: 0
            }).format(amount);
        } catch (e) {
            return (currency || "NGN") + " " + Number(amount).toLocaleString();
        }
    }

    function displayDonor(entry) {
        if (!entry) return "";
        if (entry.anonymous) return "Anonymous Donor";
        return entry.name || "Supporter";
    }

    function loadDonations() {
        var local = [];
        try {
            local = JSON.parse(localStorage.getItem("sfhf_donations_ledger") || "[]");
            if (!Array.isArray(local)) local = [];
        } catch (e) {
            local = [];
        }
        return fetch("../Charitize/api/donations.html?t=" + Date.now(), { cache: "no-store" })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                var server = (data && data.ok && Array.isArray(data.donations)) ? data.donations : [];
                var map = {};
                local.concat(server).forEach(function (entry) {
                    if (entry && entry.id) map[entry.id] = entry;
                });
                return Object.keys(map).map(function (id) { return map[id]; });
            })
            .catch(function () {
                return local;
            });
    }

    function renderDonors(list) {
        var sorted = (list || []).slice().sort(function (a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        var latestEl = document.getElementById("dashLatestDonor");
        var countEl = document.getElementById("dashDonorCount");
        if (countEl) countEl.textContent = String(sorted.length);
        if (!latestEl) return;
        if (!sorted.length) {
            latestEl.textContent = "The next name is still unwritten";
            return;
        }
        latestEl.textContent = displayDonor(sorted[0]);
        latestEl.setAttribute("title", formatMoney(sorted[0].amount, sorted[0].currency));
    }

    tickClock();
    window.setInterval(tickClock, 1000);
    loadDonations().then(renderDonors);
    window.setInterval(function () {
        loadDonations().then(renderDonors);
    }, 4000);

    var logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            if (window.SFHFPortalAuth) SFHFPortalAuth.logout();
            window.location.replace("login.html?from=logout");
        });
    }
})();
