(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;

    const setSlide = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, current) => {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach((dot, current) => {
        dot.classList.toggle('active', current === index);
      });
    };

    if (slides.length > 0) {
      prev?.addEventListener('click', () => setSlide(index - 1));
      next?.addEventListener('click', () => setSlide(index + 1));
      dots.forEach((dot, current) => {
        dot.addEventListener('click', () => setSlide(current));
      });
      window.setInterval(() => setSlide(index + 1), 6500);
    }
  }

  const panels = document.querySelectorAll('[data-filter-panel]');

  panels.forEach((panel) => {
    const scope = panel.parentElement || document;
    const cards = Array.from(scope.querySelectorAll('.movie-card'));
    const search = panel.querySelector('[data-card-search]');
    const clear = panel.querySelector('[data-clear-filter]');
    const yearButtons = Array.from(panel.querySelectorAll('[data-filter-year]'));
    const regionButtons = Array.from(panel.querySelectorAll('[data-filter-region]'));
    const yearSelect = panel.querySelector('[data-select-year]');
    const regionSelect = panel.querySelector('[data-select-region]');
    const typeSelect = panel.querySelector('[data-select-type]');
    let activeYear = '';
    let activeRegion = '';
    let activeType = '';

    const normalize = (value) => String(value || '').trim().toLowerCase();

    const apply = () => {
      const keyword = normalize(search?.value || '');
      cards.forEach((card) => {
        const text = normalize(card.dataset.search || '');
        const year = normalize(card.dataset.year || '');
        const region = normalize(card.dataset.region || '');
        const type = normalize(card.dataset.type || '');
        const matchedKeyword = !keyword || text.includes(keyword);
        const matchedYear = !activeYear || year === normalize(activeYear);
        const matchedRegion = !activeRegion || region === normalize(activeRegion);
        const matchedType = !activeType || type === normalize(activeType);
        card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear && matchedRegion && matchedType));
      });
    };

    search?.addEventListener('input', apply);

    yearButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeYear = button.dataset.filterYear || '';
        yearButtons.forEach((item) => item.classList.toggle('active', item === button));
        apply();
      });
    });

    regionButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeRegion = button.dataset.filterRegion || '';
        regionButtons.forEach((item) => item.classList.toggle('active', item === button));
        apply();
      });
    });

    yearSelect?.addEventListener('change', () => {
      activeYear = yearSelect.value;
      apply();
    });

    regionSelect?.addEventListener('change', () => {
      activeRegion = regionSelect.value;
      apply();
    });

    typeSelect?.addEventListener('change', () => {
      activeType = typeSelect.value;
      apply();
    });

    clear?.addEventListener('click', () => {
      if (search) search.value = '';
      if (yearSelect) yearSelect.value = '';
      if (regionSelect) regionSelect.value = '';
      if (typeSelect) typeSelect.value = '';
      activeYear = '';
      activeRegion = '';
      activeType = '';
      yearButtons.forEach((item, current) => item.classList.toggle('active', current === 0));
      regionButtons.forEach((item, current) => item.classList.toggle('active', current === 0));
      apply();
    });

    yearButtons[0]?.classList.add('active');
    regionButtons[0]?.classList.add('active');
    apply();
  });

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  const searchInput = document.querySelector('[data-card-search]');

  if (query && searchInput) {
    searchInput.value = query;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
})();
