(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => (reduceMotion.matches ? 'auto' : 'smooth');

  const esc = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const money = (n) => `£${Number.isInteger(n) ? n : n.toFixed(2)}`;

  // Calls onMissing if the image fails to load, now or later (lazy images load on scroll).
  function watchImage(img, onMissing) {
    if (img.complete) {
      if (img.naturalWidth === 0) onMissing(img);
      return;
    }
    img.addEventListener('error', () => onMissing(img), { once: true });
  }

  /* ---------- Missing photos fall back to a styled panel ---------- */
  $$('[data-media] img').forEach((img) =>
    watchImage(img, () => img.closest('[data-media]').classList.add('is-missing')),
  );
  const brand = $('[data-brand]');
  const logo = brand && $('.brand-logo', brand);
  if (logo) watchImage(logo, () => brand.classList.add('is-missing'));

  /* ---------- Header ---------- */
  const header = $('[data-header]');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Highlight the nav link for the section in the middle of the screen.
  const navLinks = $$('[data-nav]');
  if ('IntersectionObserver' in window && navLinks.length) {
    const inView = new Map();
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => inView.set(e.target.id, e.isIntersecting));
        navLinks.forEach((a) => {
          if (inView.get(a.dataset.nav)) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    navLinks.forEach((a) => {
      const target = document.getElementById(a.dataset.nav);
      if (target) spy.observe(target);
    });
  }

  /* ---------- Scroll reveals ---------- */
  const reveals = $$('.reveal');
  if (!reduceMotion.matches && 'IntersectionObserver' in window) {
    reveals.forEach((el) => {
      const parent = el.parentElement;
      if (parent && parent.matches('ul')) {
        const i = Array.from(parent.children).indexOf(el);
        el.style.setProperty('--d', `${Math.min(i, 5) * 80}ms`);
      }
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Open / closed, in London time ---------- */
  const OPENS = 12 * 60;
  const CLOSES = 22 * 60;
  const DELIVERY_CLOSES = 23 * 60;

  function londonMinutes() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23',
    }).formatToParts(new Date());
    const get = (type) => Number(parts.find((p) => p.type === type).value);
    return get('hour') * 60 + get('minute');
  }

  function updateOpenStatus() {
    let now;
    try {
      now = londonMinutes();
    } catch {
      return; // Keep the static "Open daily" text.
    }
    const open = now >= OPENS && now < CLOSES;
    let text = 'Open now · until 22:00';
    if (now < OPENS) text = 'Closed now · opens at 12:00';
    else if (now >= CLOSES && now < DELIVERY_CLOSES) text = 'Restaurant closed · delivery until 23:00';
    else if (now >= DELIVERY_CLOSES) text = 'Closed now · opens tomorrow at 12:00';
    $$('[data-open-status]').forEach((el) => {
      el.textContent = text;
      el.classList.toggle('is-open', open);
      el.classList.toggle('is-closed', !open);
    });
  }
  updateOpenStatus();
  setInterval(updateOpenStatus, 60 * 1000);

  /* ---------- Menu + drinks (from data/menu.json) ---------- */
  function pricesHTML(prices) {
    const list = (prices || []).filter((p) => typeof p.amount === 'number');
    if (!list.length) return '';
    return `<div class="mi-prices">${list
      .map(
        (p) =>
          `<span class="mi-price">${p.label ? `<span class="mi-price-label">${esc(p.label)}</span>` : ''}${money(p.amount)}</span>`,
      )
      .join('')}</div>`;
  }

  function allergenText(value) {
    if (!value) return '';
    return Array.isArray(value) ? value.join(', ') : String(value);
  }

  function menuItemHTML(item) {
    const allergens = allergenText(item.allergens);
    return `<li class="menu-item" data-veg="${item.veg ? 'true' : 'false'}">
      <div class="mi-main">
        <p class="mi-name">${esc(item.name)}${item.veg ? ' <abbr class="tag-v" title="Vegetarian">V</abbr>' : ''}</p>
        ${item.note ? `<p class="mi-note">${esc(item.note)}</p>` : ''}
        ${item.description ? `<p class="mi-desc">${esc(item.description)}</p>` : ''}
        ${allergens ? `<p class="mi-allergens"><strong>Allergens:</strong> ${esc(allergens)}</p>` : ''}
      </div>
      ${pricesHTML(item.prices)}
    </li>`;
  }

  function renderMenu(sections) {
    const bar = $('[data-menu-bar]');
    const tabList = $('[data-menu-tabs]');
    const panelsRoot = $('[data-menu-panels]');
    const vegToggle = $('[data-veg-toggle]');
    sections = sections.filter((s) => s.items && s.items.length);
    if (!sections.length) throw new Error('Menu has no sections');

    panelsRoot.innerHTML = '';
    tabList.innerHTML = '';

    const tabs = sections.map((section, i) => {
      const id = section.id || `section-${i}`;
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'tab';
      tab.id = `tab-${id}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `panel-${id}`);
      tab.setAttribute('aria-selected', 'false');
      tab.tabIndex = -1;
      tab.innerHTML = `${esc(section.name)}<span class="tab-count" data-count></span>`;
      tabList.append(tab);

      const panel = document.createElement('div');
      panel.className = 'panel';
      panel.id = `panel-${id}`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
      panel.hidden = true;
      panel.innerHTML = `
        <header class="panel-head">
          <h3>${esc(section.name)}</h3>
          ${section.note ? `<p class="panel-note">${esc(section.note)}</p>` : ''}
        </header>
        <ul class="menu-items" role="list">${section.items.map(menuItemHTML).join('')}</ul>
        <div class="panel-empty" data-empty hidden></div>`;
      panelsRoot.append(panel);

      return {
        tab,
        panel,
        name: section.name,
        all: section.items.length,
        veg: section.items.filter((item) => item.veg).length,
      };
    });

    let current = 0;

    function centreTab(tab) {
      const left = tab.offsetLeft - (tabList.clientWidth - tab.offsetWidth) / 2;
      tabList.scrollTo({ left, behavior: scrollBehavior() });
    }

    function select(index, { focus = false, scroll = false } = {}) {
      current = index;
      tabs.forEach((t, i) => {
        const on = i === index;
        t.tab.setAttribute('aria-selected', String(on));
        t.tab.tabIndex = on ? 0 : -1;
        t.panel.hidden = !on;
      });
      const { tab } = tabs[index];
      if (focus) tab.focus({ preventScroll: true });
      centreTab(tab);
      if (scroll) {
        // If we're scrolled past the top of the panels, bring them back under the sticky bar.
        const barBottom = bar.getBoundingClientRect().bottom;
        const top = panelsRoot.getBoundingClientRect().top;
        if (top < barBottom) window.scrollBy({ top: top - barBottom, behavior: scrollBehavior() });
      }
    }

    tabs.forEach((t, i) => t.tab.addEventListener('click', () => select(i, { scroll: true })));
    tabList.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      select(next, { focus: true, scroll: true });
    });

    // Vegetarian-only filter
    const vegSections = tabs
      .map((t, i) => ({ i, n: t.veg, name: t.name }))
      .filter((s) => s.n > 0)
      .sort((a, b) => b.n - a.n)
      .slice(0, 3);

    tabs.forEach((t) => {
      if (t.veg) return;
      $('[data-empty]', t.panel).innerHTML = `
        <p>Nothing in ${esc(t.name)} is marked vegetarian.</p>
        <p class="panel-empty-try">Try
          ${vegSections.map((s) => `<button type="button" class="chip" data-goto="${s.i}">${esc(s.name)} <span>${s.n}</span></button>`).join('')}
        </p>`;
    });
    panelsRoot.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-goto]');
      if (chip) select(Number(chip.dataset.goto), { focus: true, scroll: true });
    });

    function setVegOnly(on) {
      vegToggle.setAttribute('aria-checked', String(on));
      panelsRoot.toggleAttribute('data-veg-only', on);
      tabs.forEach((t) => {
        $('[data-count]', t.tab).textContent = on ? String(t.veg) : '';
        t.tab.classList.toggle('is-empty', on && t.veg === 0);
        const none = on && t.veg === 0;
        $('[data-empty]', t.panel).hidden = !none;
        $('.menu-items', t.panel).hidden = none;
      });
    }
    vegToggle.addEventListener('click', () => setVegOnly(vegToggle.getAttribute('aria-checked') !== 'true'));

    bar.hidden = false;
    select(0);
  }

  const drinkCount = (s) =>
    (s.items || []).length + (s.groups || []).reduce((n, g) => n + (g.items || []).length, 0);

  function drinkItemHTML(item) {
    return `<li class="drink-item">
      <div>
        <p class="drink-item-name">${esc(item.name)}</p>
        ${item.description ? `<p class="drink-item-desc">${esc(item.description)}</p>` : ''}
      </div>
      ${pricesHTML(item.prices)}
    </li>`;
  }

  function drinkSectionHTML(section) {
    const items = section.items || [];
    const groups = (section.groups || []).filter((g) => g.items && g.items.length);
    const n = drinkCount(section);
    const detailed = [...items, ...groups.flatMap((g) => g.items)].some(
      (item) => item.description || (item.prices && item.prices.length),
    );

    // Short, name-only lists read better on one line than behind a toggle.
    if (!n || (!detailed && !groups.length && n <= 3)) {
      let meta = items.map((item) => item.name).join(' · ');
      if (!n && section.groups && section.groups.length) meta = section.groups.map((g) => g.name).join(' · ');
      else if (!n && section.count) meta = `${section.count} on the list`;
      return `<div class="drink-group drink-row">
        <span class="drink-name">${esc(section.name)}</span>
        <span class="drink-meta">${esc(meta)}</span>
      </div>`;
    }

    const list = (arr) => `<ul class="drink-items" role="list">${arr.map(drinkItemHTML).join('')}</ul>`;
    return `<details class="drink-group">
      <summary>
        <span class="drink-name">${esc(section.name)}</span>
        <span class="drink-meta">${n}</span>
        <svg class="icon drink-chevron" aria-hidden="true"><use href="#i-down"/></svg>
      </summary>
      <div class="drink-body">
        ${section.note ? `<p class="drink-note">${esc(section.note)}</p>` : ''}
        ${items.length ? list(items) : ''}
        ${groups.map((g) => `<p class="drink-subhead">${esc(g.name)}</p>${list(g.items)}`).join('')}
      </div>
    </details>`;
  }

  function renderDrinks(sections) {
    const root = $('[data-drinks]');
    if (!root) return;
    root.innerHTML = sections.map(drinkSectionHTML).join('');

    // Named bottles on the wine tile, grouped by red / white / rosé.
    const wineGroups = sections
      .filter((s) => /wine/i.test(`${s.id} ${s.name}`))
      .flatMap((s) => (s.groups && s.groups.length ? s.groups : [{ name: s.name, items: s.items || [] }]))
      .filter((g) => g.items && g.items.length);
    const bottles = $('[data-wine-bottles]');
    if (bottles && wineGroups.length) {
      bottles.innerHTML = wineGroups
        .map(
          (g) => `<div>
            <p class="wine-type">${esc(g.name)}</p>
            <p class="wine-names">${g.items.map((item) => esc(item.name)).join(' · ')}</p>
          </div>`,
        )
        .join('');
      bottles.hidden = false;
    }

    const cocktails = sections.find((s) => /cocktail/i.test(`${s.id} ${s.name}`));
    const count = cocktails && (drinkCount(cocktails) || cocktails.count);
    if (count) $$('[data-cocktail-count]').forEach((el) => (el.textContent = String(count)));
  }

  async function loadMenu() {
    const status = $('[data-menu-status]');
    try {
      const res = await fetch('data/menu.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      renderMenu(data.food || []);
      renderDrinks(data.drinks || []);
    } catch (err) {
      if (status) {
        status.innerHTML =
          'The menu didn’t load. You can see it on <a href="https://www.mimoslounge.co.uk/order">our ordering page</a>.';
      }
      console.warn('Menu could not be loaded:', err);
    }
  }
  loadMenu();

  /* ---------- Gallery lightbox ---------- */
  function initGallery() {
    const section = $('[data-gallery]');
    const dialog = section && $('[data-lightbox]', section);
    if (!dialog) return;
    const img = $('[data-lb-img]', dialog);
    const counter = $('[data-lb-count]', dialog);
    const prev = $('[data-lb-prev]', dialog);
    const next = $('[data-lb-next]', dialog);
    let items = $$('.gallery-item', section);
    let index = 0;
    let opener = null;

    const refresh = () => {
      items = $$('.gallery-item', section);
      section.hidden = items.length === 0;
      prev.hidden = next.hidden = items.length < 2;
    };
    const drop = (btn) => {
      btn.closest('li').remove();
      refresh();
    };

    // Thumbnails are lazy, so check up front which photos exist to avoid tiles vanishing mid-scroll.
    items.forEach((btn) => {
      const thumb = $('img', btn);
      watchImage(thumb, () => btn.isConnected && drop(btn));
      fetch(thumb.getAttribute('src'), { method: 'HEAD' })
        .then((res) => !res.ok && btn.isConnected && drop(btn))
        .catch(() => {});
    });
    refresh();

    function show(i) {
      index = (i + items.length) % items.length;
      const btn = items[index];
      img.src = btn.dataset.full;
      img.alt = $('img', btn).alt;
      counter.textContent = `${index + 1} / ${items.length}`;
    }
    // Fall back to the thumbnail if the full-size file is missing.
    img.addEventListener('error', () => {
      const thumb = $('img', items[index]);
      if (thumb && img.src !== thumb.src) img.src = thumb.src;
    });

    function open(i, trigger) {
      if (typeof dialog.showModal !== 'function') {
        window.open(trigger.dataset.full, '_blank', 'noopener');
        return;
      }
      opener = trigger;
      show(i);
      dialog.showModal();
      document.documentElement.classList.add('is-locked');
    }

    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('is-locked');
      if (opener) opener.focus();
    });
    section.addEventListener('click', (e) => {
      const btn = e.target.closest('.gallery-item');
      if (btn) open(items.indexOf(btn), btn);
    });
    $('[data-lb-close]', dialog).addEventListener('click', () => dialog.close());
    prev.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      else if (e.key === 'ArrowRight') show(index + 1);
    });
    // Click outside the photo closes.
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog || e.target.classList.contains('lb-figure')) dialog.close();
    });

    let startX = null;
    dialog.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX), { passive: true });
    dialog.addEventListener(
      'touchend',
      (e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
        startX = null;
      },
      { passive: true },
    );
  }
  initGallery();

  /* ---------- Embers rising off the grill ---------- */
  function initEmbers() {
    const canvas = $('[data-embers]');
    if (!canvas || reduceMotion.matches || !('IntersectionObserver' in window)) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colours = ['251,172,115', '224,145,35', '255,214,170', '174,11,16'];
    const sparks = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    let running = false;
    let disabled = false;

    function reset(s, anywhere) {
      s.x = Math.random() * width;
      s.y = anywhere ? height * (0.3 + Math.random() * 0.7) : height + 6;
      s.r = 0.6 + Math.random() * 1.6;
      s.speed = 18 + Math.random() * 46;
      s.drift = (Math.random() - 0.5) * 16;
      s.phase = Math.random() * Math.PI * 2;
      s.flicker = 2 + Math.random() * 5;
      s.colour = colours[Math.random() < 0.12 ? 3 : Math.floor(Math.random() * 3)];
      return s;
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = width < 640 ? 26 : 54;
      while (sparks.length < target) sparks.push(reset({}, true));
      sparks.length = target;
    }

    function frame(t) {
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      for (const s of sparks) {
        s.y -= s.speed * dt;
        s.phase += dt * 1.6;
        s.x += (s.drift + Math.sin(s.phase) * 12) * dt;
        const life = 1 - s.y / height; // 0 at the bottom, 1 at the top
        if (life >= 1 || s.y < -8) {
          reset(s, false);
          continue;
        }
        const glow = Math.pow(1 - life, 1.6) * (0.65 + 0.35 * Math.sin((t / 1000) * s.flicker + s.phase));
        ctx.fillStyle = `rgba(${s.colour},${(glow * 0.16).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${s.colour},${glow.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    const start = () => {
      if (running || disabled) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize);

    let visible = false;
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !document.hidden) start();
      else stop();
    }).observe(canvas);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (visible) start();
    });
    reduceMotion.addEventListener?.('change', (e) => {
      if (!e.matches) return;
      disabled = true;
      stop();
      ctx.clearRect(0, 0, width, height);
    });
  }
  initEmbers();
})();
