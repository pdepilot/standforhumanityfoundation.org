(function (global) {
    "use strict";

    var KEY = "sfhf_portal_wash";

    var WASHES = [
        { wash: "#0020B0", soft: "#3d5cff", accent: "#FFAC00", image: "../Charitize/img/stand2.jpg" },
        { wash: "#8A5A00", soft: "#FFAC00", accent: "#FFE08A", image: "../Charitize/img/stand4.jpg" },
        { wash: "#4A148C", soft: "#9C4DFF", accent: "#E1BEE7", image: "../Charitize/img/stand5.jpg" },
        { wash: "#004D40", soft: "#1DB8A6", accent: "#80CBC4", image: "../Charitize/img/stand1.jpg" },
        { wash: "#880E4F", soft: "#E91E63", accent: "#F8BBD0", image: "../Charitize/img/stand3.jpg" },
        { wash: "#BF360C", soft: "#FF7043", accent: "#FFCCBC", image: "../Charitize/img/carousel-1.jpg" },
        { wash: "#1B5E20", soft: "#43A047", accent: "#A5D6A7", image: "../Charitize/img/about.jpg" },
        { wash: "#0A1628", soft: "#1565C0", accent: "#90CAF9", image: "../Charitize/img/pic4.jpg" }
    ];

    function index() {
        var n = Number(localStorage.getItem(KEY) || 0);
        if (!isFinite(n) || n < 0) n = 0;
        return n % WASHES.length;
    }

    function current() {
        return WASHES[index()];
    }

    function advance() {
        localStorage.setItem(KEY, String((index() + 1) % WASHES.length));
        return current();
    }

    function apply(root) {
        var visual = root || document.getElementById("loginVisual");
        if (!visual) return current();
        var theme = current();
        visual.style.setProperty("--wash", theme.wash);
        visual.style.setProperty("--wash-soft", theme.soft);
        visual.style.setProperty("--accent", theme.accent);
        var img = document.getElementById("loginVisualImg");
        if (img) {
            img.src = theme.image;
            img.alt = "Stand For Humanity Foundation";
        }
        return theme;
    }

    global.SFHFPortalWash = {
        current: current,
        advance: advance,
        apply: apply,
        index: index
    };
})(window);
