(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
      document.body.classList.toggle("menu-open", panel.classList.contains("open"));
    });
  }

  function setupSiteSearch() {
    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = "./search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    var label = select.options.length ? select.options[0].textContent : "全部";
    select.innerHTML = "";
    var first = document.createElement("option");
    first.value = "";
    first.textContent = label;
    select.appendChild(first);
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var list = document.querySelector("[data-filter-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var input = document.querySelector("[data-filter-input]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var genreSelect = document.querySelector("[data-filter-genre]");
    var empty = document.querySelector("[data-empty-state]");
    var years = [];
    var genres = [];

    cards.forEach(function (card) {
      var year = card.getAttribute("data-year") || "";
      var genreText = card.getAttribute("data-genre") || "";
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
      genreText.split(/[，,\/、]+/).forEach(function (part) {
        var item = part.trim();
        if (item && genres.indexOf(item) === -1) {
          genres.push(item);
        }
      });
    });

    years.sort().reverse();
    genres.sort();
    fillSelect(yearSelect, years);
    fillSelect(genreSelect, genres);

    function apply() {
      var query = normalize(input ? input.value : "");
      var year = yearSelect ? yearSelect.value : "";
      var genre = genreSelect ? genreSelect.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" "));
        var matched = true;
        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          matched = false;
        }
        if (genre && (card.getAttribute("data-genre") || "").indexOf(genre) === -1) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", apply);
    }
    if (genreSelect) {
      genreSelect.addEventListener("change", apply);
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input) {
      input.value = q;
    }
    apply();
  }

  ready(function () {
    setupMenu();
    setupSiteSearch();
    setupHero();
    setupFilters();
  });
})();

function setupMoviePlayer(streamUrl) {
  var player = document.querySelector("[data-player]");
  if (!player) {
    return;
  }
  var video = player.querySelector("video");
  var button = player.querySelector(".play-trigger");
  var started = false;
  var hlsInstance = null;

  function playVideo() {
    if (!video) {
      return;
    }
    if (button) {
      button.classList.add("is-hidden");
    }
    if (started) {
      video.play().catch(function () {});
      return;
    }
    started = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.play().catch(function () {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }
    video.src = streamUrl;
    video.play().catch(function () {});
  }

  if (button) {
    button.addEventListener("click", playVideo);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (!started || video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
  }
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
