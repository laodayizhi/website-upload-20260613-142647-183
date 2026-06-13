(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function rootPath() {
        return document.body.getAttribute('data-root') || '';
    }

    function initMenu() {
        var button = document.querySelector('.menu-button');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var open = panel.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHero() {
        var slider = document.querySelector('.hero-slider');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var prev = slider.querySelector('.hero-prev');
        var next = slider.querySelector('.hero-next');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('is-active', idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('is-active', idx === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener('click', function () {
                show(idx);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        restart();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
        panels.forEach(function (panel) {
            var input = panel.querySelector('.local-filter-input');
            var selects = Array.prototype.slice.call(panel.querySelectorAll('.local-filter-select'));
            var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-targets .movie-card'));

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var filters = {};
                selects.forEach(function (select) {
                    filters[select.getAttribute('data-filter')] = select.value;
                });
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-tags') || '',
                        card.getAttribute('data-type') || '',
                        card.getAttribute('data-year') || ''
                    ].join(' ').toLowerCase();
                    var matchText = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchType = !filters.type || card.getAttribute('data-type') === filters.type;
                    var matchYear = !filters.year || card.getAttribute('data-year') === filters.year;
                    card.classList.toggle('is-filtered-out', !(matchText && matchType && matchYear));
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
        });
    }

    function initPlayer() {
        var video = document.getElementById('videoPlayer');
        var button = document.getElementById('playButton');
        var overlay = document.getElementById('playerOverlay');
        if (!video || !button || !overlay) {
            return;
        }
        var stream = button.getAttribute('data-stream');
        var hls = null;
        var attached = false;

        function playVideo() {
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }

        function start() {
            if (!stream) {
                return;
            }
            overlay.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (video.getAttribute('src') !== stream) {
                    video.setAttribute('src', stream);
                }
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!hls) {
                    hls = new window.Hls({
                        maxBufferLength: 30,
                        capLevelToPlayerSize: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        attached = true;
                        playVideo();
                    });
                } else if (attached) {
                    playVideo();
                }
                return;
            }
            if (video.getAttribute('src') !== stream) {
                video.setAttribute('src', stream);
            }
            playVideo();
        }

        button.addEventListener('click', start);
        overlay.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
            '<a class="movie-card" href="' + escapeHtml(movie.url) + '" data-title="' + escapeHtml(movie.title) + '">' +
                '<div class="poster-wrap">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="type-badge">' + escapeHtml(movie.type) + '</span>' +
                '</div>' +
                '<div class="movie-card-body">' +
                    '<h3>' + escapeHtml(movie.title) + '</h3>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="movie-meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</a>';
    }

    function initSearchPage() {
        var results = document.getElementById('searchResults');
        if (!results || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var title = document.getElementById('searchTitle');
        var input = document.getElementById('searchInput');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input) {
            input.value = query;
        }
        var normalized = query.trim().toLowerCase();
        var source = window.MOVIE_SEARCH_DATA;
        var list = normalized ? source.filter(function (movie) {
            var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' ')].join(' ').toLowerCase();
            return haystack.indexOf(normalized) !== -1;
        }) : source.slice(0, 80);
        if (title) {
            title.textContent = normalized ? '搜索结果：' + query : '推荐影片';
        }
        if (!list.length) {
            results.innerHTML = '<div class="search-empty">没有找到匹配影片，可以尝试更换关键词。</div>';
            return;
        }
        results.innerHTML = list.slice(0, 160).map(cardTemplate).join('');
    }

    function initHeaderSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('.header-search, .mobile-search, .large-search'));
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || input.value.trim()) {
                    return;
                }
                event.preventDefault();
                window.location.href = rootPath() + 'search.html';
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
        initSearchPage();
        initHeaderSearch();
    });
})();
