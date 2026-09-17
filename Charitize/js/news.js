(function () {
    var buttons = document.querySelectorAll("[data-news-filter]");
    var cards = document.querySelectorAll("[data-news-category]");
    if (!buttons.length || !cards.length) return;

    function applyFilter(filter) {
        cards.forEach(function (card) {
            var category = card.getAttribute("data-news-category");
            var show = filter === "all" || category === filter;
            card.classList.toggle("is-hidden", !show);
        });
        buttons.forEach(function (btn) {
            var active = btn.getAttribute("data-news-filter") === filter;
            btn.classList.toggle("btn-secondary", active);
            btn.classList.toggle("btn-outline-secondary", !active);
            btn.setAttribute("aria-pressed", active ? "true" : "false");
        });
    }

    buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            applyFilter(btn.getAttribute("data-news-filter"));
        });
    });
})();
