(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function pause() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                pause();
                show(Number(dot.getAttribute("data-slide") || 0));
                play();
            });
        });
        carousel.addEventListener("mouseenter", pause);
        carousel.addEventListener("mouseleave", play);
        play();
    }

    function applyFilters(container, query, pillValue) {
        var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card, .searchable-row"));
        var visible = 0;
        var normalizedQuery = normalize(query);
        var normalizedPill = normalize(pillValue === "all" ? "" : pillValue);
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-search"));
            var matchesQuery = !normalizedQuery || haystack.indexOf(normalizedQuery) !== -1;
            var matchesPill = !normalizedPill || haystack.indexOf(normalizedPill) !== -1;
            var matched = matchesQuery && matchesPill;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });
        var empty = document.querySelector(".empty-state");
        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    function initLocalSearch() {
        var grid = document.querySelector(".searchable-grid") || document.querySelector(".rank-list");
        if (!grid) {
            return;
        }
        var localInput = document.querySelector(".local-search") || document.querySelector(".search-page-input");
        var pills = Array.prototype.slice.call(document.querySelectorAll(".filter-pill"));
        var activePill = "all";
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        if (localInput) {
            localInput.value = initialQuery;
        }
        applyFilters(grid, initialQuery, activePill);
        if (localInput) {
            localInput.addEventListener("input", function () {
                applyFilters(grid, localInput.value, activePill);
            });
        }
        pills.forEach(function (pill) {
            pill.addEventListener("click", function () {
                pills.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                pill.classList.add("is-active");
                activePill = pill.getAttribute("data-filter") || "all";
                applyFilters(grid, localInput ? localInput.value : "", activePill);
            });
        });
    }

    ready(function () {
        initMenu();
        initHeroCarousel();
        initLocalSearch();
    });
})();
