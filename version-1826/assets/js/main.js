(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
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

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var filterInput = document.querySelector("[data-local-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function applyLocalFilter() {
      var query = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var year = yearFilter ? yearFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-category")
        ].join(" ").toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !year || card.getAttribute("data-year") === year;
        var matchType = !type || card.getAttribute("data-type") === type;
        card.classList.toggle("is-hidden", !(matchQuery && matchYear && matchType));
      });
    }

    if (filterInput) {
      filterInput.addEventListener("input", applyLocalFilter);
    }
    if (yearFilter) {
      yearFilter.addEventListener("change", applyLocalFilter);
    }
    if (typeFilter) {
      typeFilter.addEventListener("change", applyLocalFilter);
    }

    renderSearchPage();
  });

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function movieCardHtml(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\">",
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-year\">" + escapeHtml(movie.year || "精选") + "</span>",
      "<span class=\"poster-play\">▶</span>",
      "</a>",
      "<div class=\"card-body\">",
      "<div class=\"card-meta\"><a href=\"" + escapeHtml(movie.categoryUrl) + "\">" + escapeHtml(movie.category) + "</a><span>" + escapeHtml(movie.type) + "</span></div>",
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function renderSearchPage() {
    var resultsBox = document.querySelector("[data-search-results]");
    var form = document.querySelector("[data-search-form]");
    var title = document.querySelector("[data-search-title]");
    if (!resultsBox || !form || !window.SiteSearchData) {
      return;
    }

    var input = form.querySelector("input[name='q']");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render(query) {
      var q = query.trim().toLowerCase();
      var items = window.SiteSearchData.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.year,
          movie.type,
          movie.region,
          movie.category,
          movie.oneLine,
          (movie.tags || []).join(" ")
        ].join(" ").toLowerCase();
        return !q || haystack.indexOf(q) !== -1;
      }).slice(0, 120);

      title.textContent = q ? "搜索结果" : "推荐影片";
      resultsBox.innerHTML = items.map(movieCardHtml).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = input.value.trim();
      var url = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
      history.replaceState(null, "", url);
      render(value);
    });

    input.addEventListener("input", function () {
      render(input.value);
    });

    render(initial);
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playOverlay");
    var status = document.getElementById("playerStatus");
    var hlsInstance = null;
    var attached = false;

    if (!video || !overlay || !streamUrl) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text || "";
      }
    }

    function attachMedia() {
      if (attached) {
        return Promise.resolve();
      }
      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        return new Promise(function (resolve, reject) {
          hlsInstance = new window.Hls({
            maxBufferLength: 45,
            enableWorker: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              reject(data);
            }
          });
        });
      }

      video.src = streamUrl;
      return Promise.resolve();
    }

    function startPlayback() {
      setStatus("正在加载播放内容...");
      attachMedia()
        .then(function () {
          return video.play();
        })
        .then(function () {
          overlay.classList.add("hidden");
          setStatus("");
        })
        .catch(function () {
          attached = false;
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
          }
          setStatus("播放暂时不可用，请稍后再试");
        });
    }

    overlay.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        overlay.classList.remove("hidden");
      }
    });
  };
})();
