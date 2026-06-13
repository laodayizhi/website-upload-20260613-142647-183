(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-slide]'));
  var slideIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    slideIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, currentIndex) {
      slide.classList.toggle('active', currentIndex === slideIndex);
    });

    dots.forEach(function (dot, currentIndex) {
      dot.classList.toggle('active', currentIndex === slideIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = parseInt(dot.getAttribute('data-slide'), 10);
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5200);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = form.getAttribute('action') || 'search.html';
      }
    });
  });

  var filterInput = document.querySelector('[data-filter-input]');
  var filterType = document.querySelector('[data-filter-type]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterRegion = document.querySelector('[data-filter-region]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
  var emptyMessage = document.querySelector('[data-empty-message]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var query = normalize(filterInput ? filterInput.value : '');
    var typeValue = normalize(filterType ? filterType.value : '');
    var yearValue = normalize(filterYear ? filterYear.value : '');
    var regionValue = normalize(filterRegion ? filterRegion.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var searchText = normalize(card.getAttribute('data-search'));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var matched = true;

      if (query && searchText.indexOf(query) === -1) {
        matched = false;
      }

      if (typeValue && cardType !== typeValue) {
        matched = false;
      }

      if (yearValue && cardYear !== yearValue) {
        matched = false;
      }

      if (regionValue && cardRegion !== regionValue) {
        matched = false;
      }

      card.hidden = !matched;

      if (matched) {
        visible += 1;
      }
    });

    if (emptyMessage) {
      emptyMessage.hidden = visible !== 0;
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q');

    if (queryValue) {
      filterInput.value = queryValue;
    }

    filterInput.addEventListener('input', filterCards);
  }

  [filterType, filterYear, filterRegion].forEach(function (select) {
    if (select) {
      select.addEventListener('change', filterCards);
    }
  });

  filterCards();
})();
