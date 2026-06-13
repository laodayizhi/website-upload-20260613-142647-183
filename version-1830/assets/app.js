(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(text) {
        return (text || "").toString().trim().toLowerCase();
    }

    ready(function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupFilters();
    });

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!button || !panel) {
            return;
        }

        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", panel.classList.contains("is-open"));
        });
    }

    function setupSearchForms() {
        var forms = document.querySelectorAll("[data-search-form]");

        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var url = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
                window.location.href = url;
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
                play();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                play();
            });
        }

        hero.addEventListener("mouseenter", function () {
            clearInterval(timer);
        });

        hero.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function setupFilters() {
        var grids = document.querySelectorAll("[data-filter-grid]");

        grids.forEach(function (grid) {
            var section = grid.closest("section") || document;
            var keywordInput = section.querySelector("[data-filter-keyword]");
            var typeSelect = section.querySelector("[data-filter-type]");
            var yearSelect = section.querySelector("[data-filter-year]");
            var empty = section.querySelector("[data-filter-empty]");
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".js-filter-card"));

            function apply() {
                var keyword = normalize(keywordInput ? keywordInput.value : "");
                var typeValue = normalize(typeSelect ? typeSelect.value : "");
                var yearValue = normalize(yearSelect ? yearSelect.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-keywords"));
                    var type = normalize(card.getAttribute("data-type"));
                    var year = normalize(card.getAttribute("data-year"));
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchType = !typeValue || type === typeValue;
                    var matchYear = !yearValue || year === yearValue;
                    var shouldShow = matchKeyword && matchType && matchYear;

                    card.hidden = !shouldShow;

                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [keywordInput, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");

            if (query && keywordInput) {
                keywordInput.value = query;
            }

            apply();
        });
    }
}());
