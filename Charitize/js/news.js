(function () {
    var articleRoutes = {
        "child-protection": "news/child-protection.html",
        "domestic-abuse": "news/domestic-abuse.html",
        "victim-advocacy": "news/victim-advocacy.html",
        "volunteer-bootcamp": "news/volunteer-bootcamp.html",
        "report-live-hours": "news/report-live-hours.html",
        "awareness-walk": "news/awareness-walk.html",
        "founders-note": "news/founders-note.html"
    };

    var hash = (window.location.hash || "").replace(/^#/, "");
    if (hash && articleRoutes[hash]) {
        window.location.replace(articleRoutes[hash]);
        return;
    }

    var form = document.querySelector("[data-news-search]");
    var input = form ? form.querySelector("input[name='q']") : null;
    var cards = document.querySelectorAll("[data-news-item]");
    var empty = document.querySelector("[data-news-empty]");
    var hints = document.querySelectorAll("[data-news-hint]");
    if (!form || !input || !cards.length) return;

    function setHints(query) {
        var q = (query || "").trim().toLowerCase();
        hints.forEach(function (hint) {
            var value = (hint.getAttribute("data-news-hint") || "").toLowerCase();
            hint.classList.toggle("is-active", q !== "" && value === q);
        });
    }

    function applySearch(query) {
        var q = (query || "").trim().toLowerCase();
        var shown = 0;
        cards.forEach(function (card) {
            var haystack = (card.getAttribute("data-search") || "").toLowerCase();
            var match = !q || haystack.indexOf(q) !== -1;
            card.classList.toggle("is-hidden", !match);
            if (match) shown += 1;
        });
        if (empty) empty.classList.toggle("is-visible", shown === 0);
        setHints(q);
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (initial) {
        input.value = initial;
        applySearch(initial);
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        applySearch(input.value);
    });

    input.addEventListener("input", function () {
        applySearch(input.value);
    });

    hints.forEach(function (hint) {
        hint.addEventListener("click", function () {
            var value = hint.getAttribute("data-news-hint") || "";
            if (input.value.trim().toLowerCase() === value.toLowerCase()) {
                input.value = "";
            } else {
                input.value = value;
            }
            applySearch(input.value);
            input.focus();
        });
    });
})();
