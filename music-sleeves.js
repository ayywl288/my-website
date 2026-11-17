(() => {
  const shelf = document.querySelector('.music-shelf');
  if (!shelf) return;
  const items = [...shelf.querySelectorAll('.track-item')];
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  let open = null, pinned = null, hovered = null, dismissed = null, timer;

  function place(item) {
    const slot = item.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    const limit = 14;
    const headerBottom = document.querySelector('.sitehead')?.getBoundingClientRect().bottom ?? 0;
    const top = Math.ceil(Math.max(-15, headerBottom + 6 - slot.top));
    item.style.setProperty('--sleeve-top', top + 'px');
    const width = Math.min(viewport - 2 * limit, Math.max(300, Math.min(360, Math.round(slot.width * 2.25))));
    const x = Math.round(Math.min(Math.max(limit, slot.left), viewport - limit - width));
    item.style.setProperty('--slot-height', Math.ceil(slot.height) + 'px');
    item.style.setProperty('--sleeve-offset', x - Math.round(slot.left) + 'px');
    item.style.setProperty('--sleeve-width', width + 'px');
  }

  function paint() {
    const next = pinned || (hovered !== dismissed ? hovered : null);
    if (open === next) return;
    if (open) {
      open.removeAttribute('data-track-open');
      open.querySelector('.track-disclose').setAttribute('aria-expanded','false');
    }
    open = next;
    if (open) {
      place(open);
      open.setAttribute('data-track-open','');
      open.querySelector('.track-disclose').setAttribute('aria-expanded','true');
    }
  }

  function close(restoreFocus = false) {
    clearTimeout(timer);
    const button = open?.querySelector('.track-disclose');
    const focused = open?.contains(document.activeElement);
    pinned = null;
    dismissed = hovered;
    paint();
    if (restoreFocus && focused) button?.focus({preventScroll:true});
  }

  for (const item of items) {
    const button = item.querySelector('.track-disclose');
    button.hidden = false;
    item.addEventListener('pointerenter', event => {
      if (!fine.matches || event.pointerType === 'touch') return;
      clearTimeout(timer);
      if (hovered !== item) dismissed = null;
      hovered = item;
      if (!pinned) paint();
    });
    item.addEventListener('pointerleave', () => {
      if (hovered !== item) return;
      timer = setTimeout(() => {
        if (hovered === item) hovered = null;
        if (dismissed === item) dismissed = null;
        paint();
      }, 120);
    });
    button.addEventListener('click', () => {
      if (open === item) { close(); return; }
      pinned = item;
      dismissed = null;
      paint();
    });
  }
  document.addEventListener('pointerdown', event => {
    if (pinned && !pinned.contains(event.target)) close();
  });
  shelf.addEventListener('focusout', event => {
    if (pinned && !pinned.contains(event.relatedTarget)) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) close(true);
  });
  window.addEventListener('resize', () => {
    if (!open) return;
    open.removeAttribute('data-track-open');
    place(open);
    open.setAttribute('data-track-open','');
  });
})();
