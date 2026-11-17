(() => {
  const shelf = document.querySelector('.music-shelf');
  if (!shelf) return;
  const items = [...shelf.querySelectorAll('.track-item')];
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const gap = 11, gutter = 12, maxTravel = 22;
  let open = null, pinned = null, hovered = null, dismissed = null, timer, frame;

  function place(item) {
    const anchor = item.querySelector('.track-body').getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    const paintedRight = reduced.matches ? anchor.right : anchor.right - anchor.width * .057 - 9;
    const startAt = paintedRight + gap;
    const longest = Math.max(186, Math.min(260, Math.round(anchor.width * 1.55)));
    const available = Math.floor(viewport - gutter - startAt);
    const side = available >= 142;
    const width = Math.floor(Math.min(longest, side ? available : viewport - 2 * gutter));
    const x = side ? startAt : Math.min(Math.max(gutter, anchor.left), viewport - gutter - width);
    const travel = Math.round(Math.max(0, Math.min(maxTravel, viewport - x - width - 2)));
    for (const [key, val] of Object.entries({
      'sleeve-left': Math.round(x - anchor.left), 'sleeve-width':width, 'sleeve-travel':travel,
      'sleeve-top':side ? Math.max(5,Math.round(anchor.height * .55)) : Math.ceil(anchor.height + 9)
    })) item.style.setProperty('--' + key, val + 'px');
  }

  function paint() {
    const next = pinned || (hovered !== dismissed ? hovered : null);
    if (open === next) return;
    if (open) {
      open.removeAttribute('data-track-open');
      open.removeAttribute('data-sleeve-instant');
      open.querySelector('.track-disclose').setAttribute('aria-expanded','false');
    }
    open = next;
    if (open) {
      place(open);
      open.setAttribute('data-track-open','');
      open.querySelector('.track-disclose').setAttribute('aria-expanded','true');
    }
  }

  function updatePlacement() {
    if (!open || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!open) return;
      open.setAttribute('data-sleeve-instant','');
      place(open);
    });
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
      }, 130);
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
  reduced.addEventListener('change', updatePlacement);
  window.addEventListener('resize', updatePlacement);
})();
