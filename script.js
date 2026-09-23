(() => {
  'use strict';
  const languageButtons = document.querySelectorAll('[data-language]');
  const translations = [...document.querySelectorAll('[data-en], [data-en-alt], [data-en-aria]')].map(element => ({element, text: element.hasAttribute('data-en') ? element.textContent : null, alt: element.getAttribute('alt'), aria: element.getAttribute('aria-label')}));
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const themeButtons = [...document.querySelectorAll('[data-theme]')];
  const paperRows = [...document.querySelectorAll('[data-paper]')];
  const themeIntros = [...document.querySelectorAll('[data-theme-intro]')];
  const resultCount = document.querySelector('.result-count');
  const themeSelect = document.querySelector('#theme-select');
  const sectionDisclosures = [...document.querySelectorAll('.section-disclosure')];
  let activeTheme = themeSelect.value;
  function filterPapers(theme) {
    activeTheme = theme;
    let count = 0;
    paperRows.forEach(row => {
      const visible = theme === 'all' || row.dataset.themes.split(' ').includes(theme);
      row.hidden = !visible;
      if (visible) count += 1;
    });
    themeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.theme === theme)));
    themeIntros.forEach(intro => { intro.hidden = intro.dataset.themeIntro !== theme; });
    themeSelect.value = theme;
    if (resultCount) resultCount.textContent = document.documentElement.lang === 'en' ? `${count} selected papers` : `${count} 篇选录论文`;
  }
  function closeMenu() { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); }
  function setLanguage(language) {
    const english = language === 'en';
    document.documentElement.lang = english ? 'en' : 'zh-CN';
    translations.forEach(({element, text, alt, aria}) => {
      if (text !== null) element.textContent = english ? element.dataset.en : text;
      if (alt !== null && element.hasAttribute('data-en-alt')) element.alt = english ? element.dataset.enAlt : alt;
      if (aria !== null && element.hasAttribute('data-en-aria')) element.setAttribute('aria-label', english ? element.dataset.enAria : aria);
    });
    languageButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
    document.title = english ? 'Song He — Theoretical Physics' : '何颂 Song He — 研究 · 思想 · 科学传播';
    document.querySelector('meta[name="description"]').content = english ? 'Song He, theoretical physicist at ITP, Chinese Academy of Sciences. Research, publications and data on scattering amplitudes, quantum field theory and mathematical structures.' : '何颂｜理论物理。探索散射振幅、量子场论与几何结构，以及量子引力和弦论。研究、思想与科学传播。';
    try { localStorage.setItem('song-he-language', language); } catch (_) { /* File previews may restrict local storage. */ }
    filterPapers(activeTheme);
  }
  document.documentElement.classList.add('has-js');
  themeButtons.forEach(button => button.addEventListener('click', () => filterPapers(button.dataset.theme)));
  themeSelect.addEventListener('change', () => filterPapers(themeSelect.value));
  let disclosuresBeforePrint = [];
  window.addEventListener('beforeprint', () => {
    disclosuresBeforePrint = sectionDisclosures.map(details => details.open);
    sectionDisclosures.forEach(details => { details.open = true; });
  });
  window.addEventListener('afterprint', () => {
    sectionDisclosures.forEach((details, i) => { details.open = disclosuresBeforePrint[i]; });
  });
  document.querySelectorAll('a[href="#publications"], a[href="#resources"]').forEach(link => link.addEventListener('click', () => {
    document.querySelector(link.getAttribute('href') + ' .section-disclosure').open = true;
  }));
  document.querySelectorAll('[data-theme-target]').forEach(link => link.addEventListener('click', () => filterPapers(link.dataset.themeTarget)));
  languageButtons.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
  menu.addEventListener('click', () => { const opened = menu.getAttribute('aria-expanded') === 'true'; nav.classList.toggle('is-open', !opened); menu.setAttribute('aria-expanded', String(!opened)); });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menu.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  const imageViewer = document.querySelector('.image-viewer');
  const previewImage = imageViewer.querySelector('.image-viewer-image');
  document.querySelectorAll('[data-image-zoom]').forEach(button => button.addEventListener('click', () => {
    const source = button.querySelector('img');
    previewImage.src = source.currentSrc || source.src;
    previewImage.alt = source.alt;
    const caption = button.closest('figure').querySelector('figcaption');
    imageViewer.querySelector('#image-viewer-caption').textContent = caption ? caption.innerText : source.alt;
    imageViewer.showModal();
  }));
  imageViewer.querySelector('[data-close-image]').addEventListener('click', () => imageViewer.close());
  imageViewer.addEventListener('click', event => {
    if (event.target !== imageViewer) return;
    const bounds = imageViewer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) imageViewer.close();
  });
  imageViewer.addEventListener('close', () => previewImage.removeAttribute('src'));
  const wideScreen = window.matchMedia('(min-width: 901px)');
  wideScreen.addEventListener('change', event => { if (event.matches) closeMenu(); });
  let initialLanguage = 'zh';
  try { if (localStorage.getItem('song-he-language') === 'en') initialLanguage = 'en'; } catch (_) { /* Chinese is the offline default. */ }
  const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
  if (requestedLanguage === 'en' || requestedLanguage === 'zh') initialLanguage = requestedLanguage;
  setLanguage(initialLanguage);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { nav.querySelectorAll('a').forEach(link => { if (link.getAttribute('href') === '#' + entry.target.id) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); } }); }, {rootMargin: '-15% 0px -60% 0px', threshold: 0});
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
  }
})();
