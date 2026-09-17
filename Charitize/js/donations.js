(function () {
    "use strict";

    var STORAGE_KEY = "sfhf_donations_ledger";
    var SPENT_KEY = "sfhf_donations_spent";
    var JUST_KEY = "sfhf_just_donated";
    var PING_KEY = "sfhf_donations_ping";
    var DEFAULT_SPENT = 0;

    var causeLabels = {
        "child-protection": "Child Protection & Rescue",
        "rescue": "Emergency Rescue & Intervention",
        "victim-support": "Victim Support & Advocacy",
        "community-awareness": "Community Awareness & Advocacy",
        "general": "General Donation"
    };

    var toNgn = {
        NGN: 1,
        USD: 1600,
        GBP: 2050,
        EUR: 1750
    };

    var knownIds = null;
    var justDonated = null;
    var lastPing = null;

    function apiUrl() {
        return "api/donations.html";
    }

    function loadLocal() {
        try {
            var stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            return Array.isArray(stored) ? stored : [];
        } catch (e) {
            return [];
        }
    }

    function saveLocal(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) {}
    }

    function mergeById(lists) {
        var map = {};
        lists.forEach(function (list) {
            (list || []).forEach(function (entry) {
                if (entry && entry.id) map[entry.id] = entry;
            });
        });
        return Object.keys(map).map(function (id) { return map[id]; });
    }

    function getSpent() {
        var spent = Number(localStorage.getItem(SPENT_KEY));
        if (!spent || isNaN(spent)) {
            return DEFAULT_SPENT;
        }
        return spent;
    }

    function maskPhone(phone) {
        var digits = String(phone || "").replace(/\D/g, "");
        if (!digits) return "••••••••";
        if (digits.length <= 4) return "****" + digits;
        var start = digits.slice(0, 3);
        var end = digits.slice(-2);
        return start + "****" + end;
    }

    function truncateText(text, max) {
        var t = String(text || "").trim();
        if (!t) return "—";
        if (t.length <= max) return t;
        return t.slice(0, max).trim() + "…";
    }

    function formatMoney(amount, currency) {
        var cur = currency || "NGN";
        try {
            return new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: cur,
                maximumFractionDigits: 0
            }).format(amount);
        } catch (e) {
            return cur + " " + Number(amount).toLocaleString();
        }
    }

    function formatNgn(amount) {
        return formatMoney(amount, "NGN");
    }

    function toBankNgn(entry) {
        var rate = toNgn[entry.currency] || 1;
        return Number(entry.amount || 0) * rate;
    }

    function formatDateTime(iso) {
        var d = new Date(iso);
        if (isNaN(d.getTime())) return "—";
        return d.toLocaleString("en-GB", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    function displayName(entry) {
        if (entry.anonymous) return "Anonymous Donor";
        return entry.name || "Supporter";
    }

    function descriptionOf(entry) {
        if (entry.description) return entry.description;
        var cause = causeLabels[entry.cause] || entry.cause || "Donation";
        return "Donation toward " + cause;
    }

    function readJustDonated() {
        var params = new URLSearchParams(window.location.search);
        var justId = params.get("just") || "";
        var stored = null;
        try {
            stored = JSON.parse(sessionStorage.getItem(JUST_KEY) || "null");
        } catch (e) {
            stored = null;
        }
        if (stored && stored.id) {
            justDonated = stored;
            if (!justId) justId = stored.id;
        } else if (justId) {
            justDonated = { id: justId };
        }
        return justId;
    }

    var justId = readJustDonated();
    if (justDonated && justDonated.name) {
        showThankYou(justDonated);
    }

    function showThankYou(entry) {
        var box = document.getElementById("donorThankYou");
        if (!box) return;
        var nameEl = document.getElementById("donorThankYouName");
        var amountEl = document.getElementById("donorThankYouAmount");
        var shownName = (justDonated && justDonated.name) ? justDonated.name : displayName(entry || {});
        var amount = justDonated && justDonated.amount != null
            ? formatMoney(justDonated.amount, justDonated.currency)
            : (entry ? formatMoney(entry.amount, entry.currency) : "");
        if (nameEl) nameEl.textContent = shownName;
        if (amountEl) amountEl.textContent = amount;
        box.classList.remove("d-none");
    }

    function updateLatest(donations) {
        var el = document.getElementById("latestDonorLive");
        if (!el) return;
        if (!donations.length) {
            el.textContent = "The next donation will appear here instantly.";
            return;
        }
        var latest = donations[0];
        el.innerHTML = "Latest donor: <strong>" + escapeHtml(displayName(latest)) + "</strong> — " +
            escapeHtml(formatMoney(latest.amount, latest.currency));
    }

    function render(donations) {
        var tbody = document.getElementById("donationsTableBody");
        var emptyState = document.getElementById("donationsEmpty");
        if (!tbody) return;

        donations = (donations || []).slice().sort(function (a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        var isFirst = knownIds === null;
        if (isFirst) knownIds = {};

        tbody.innerHTML = "";

        if (!donations.length) {
            if (emptyState) emptyState.classList.remove("d-none");
            updateTotals([], getSpent());
            updateLatest([]);
            setText("donorCount", "0");
            return;
        }
        if (emptyState) emptyState.classList.add("d-none");

        var scrollToRow = null;

        donations.forEach(function (entry, index) {
            var sn = donations.length - index;
            var isJust = !!(justId && entry.id === justId);
            var isNew = !isFirst && !knownIds[entry.id];
            var tr = document.createElement("tr");
            tr.setAttribute("data-donation-id", entry.id);
            if (isJust || isNew) tr.className = "donation-just-live";
            tr.innerHTML =
                "<td>" + sn + "</td>" +
                "<td>" + formatDateTime(entry.createdAt) + "</td>" +
                "<td>" + escapeHtml(displayName(entry)) +
                    (isJust || isNew ? " <span class=\"badge bg-secondary ms-1\">Just now</span>" : "") +
                "</td>" +
                "<td>" + escapeHtml(maskPhone(entry.phone)) + "</td>" +
                "<td>" + escapeHtml(truncateText(descriptionOf(entry), 48)) + "</td>" +
                "<td class=\"fw-semi-bold\">" + escapeHtml(formatMoney(entry.amount, entry.currency)) + "</td>";
            tbody.appendChild(tr);
            if (isJust) scrollToRow = tr;
            knownIds[entry.id] = true;
        });

        updateTotals(donations, getSpent());
        updateLatest(donations);
        setText("donorCount", String(donations.length));

        if (justDonated) {
            var match = donations.filter(function (d) { return d.id === justDonated.id; })[0] || donations[0];
            showThankYou(match);
        }

        if (scrollToRow) {
            window.setTimeout(function () {
                scrollToRow.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 250);
        }
    }

    function updateTotals(donations, spent) {
        var totalReceived = donations.reduce(function (sum, d) {
            return sum + toBankNgn(d);
        }, 0);
        var bankBalance = Math.max(0, totalReceived - spent);

        setText("totalInBank", formatNgn(bankBalance));
        setText("amountSpent", formatNgn(spent));
        setText("totalReceived", formatNgn(totalReceived));
    }

    function setText(id, value) {
        var el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function tickClock() {
        var nowEl = document.getElementById("liveClock");
        var updatedEl = document.getElementById("lastUpdated");
        var now = new Date();
        if (nowEl) {
            nowEl.textContent = now.toLocaleString("en-GB", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
        }
        if (updatedEl) {
            updatedEl.textContent = "Updated " + now.toLocaleTimeString("en-GB");
        }
    }

    function refresh() {
        fetch(apiUrl() + "?t=" + Date.now(), { cache: "no-store" })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                var serverList = (data && data.ok && Array.isArray(data.donations)) ? data.donations : [];
                var merged = mergeById([loadLocal(), serverList]);
                saveLocal(merged);
                render(merged);
            })
            .catch(function () {
                render(loadLocal());
            });
    }

    refresh();
    tickClock();
    window.setInterval(tickClock, 1000);
    window.setInterval(refresh, 2000);

    window.addEventListener("storage", function (e) {
        if (e.key === STORAGE_KEY || e.key === SPENT_KEY || e.key === PING_KEY) {
            refresh();
        }
    });

    window.addEventListener("focus", refresh);
})();
