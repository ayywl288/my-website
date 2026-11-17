(() => {
  const shelf = document.querySelector('.music-shelf');
  if (!shelf) return;
  const items = [...shelf.querySelectorAll('.track-item')];
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const timing = 'cubic-bezier(.19,.72,.24,1)';
  let open = null, pinned = null, hovered = null, dismissed = null, timer;
  let motions = [];

  function place(item, original) {
    const slot = item.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    const limit = 12;
    const cover = Math.round(original.width * .93);
    const height = Math.round(original.height * .93);
    const detail = Math.max(110, Math.min(viewport - cover - 34, Math.round(Math.max(172, Math.min(250, original.width * 1.43)))));
    const base = Math.min(viewport - limit - cover - 10 - detail, Math.max(limit, original.left + 12));
    const left = Math.floor(base - slot.left);
    const header = document.querySelector('.sitehead')?.getBoundingClientRect().bottom ?? 0;
    const top = Math.max(10, Math.round(header + 8 - slot.top));
    for (const [key, val] of Object.entries({
      'slot-height': Math.ceil(slot.height), 'sleeve-offset':left, 'sleeve-top':top,
      'sleeve-cover':cover, 'sleeve-height':height, 'sleeve-detail':detail,
      'sleeve-arc':Math.round(Math.max(6, (height - 106) * .34))
    })) item.style.setProperty('--' + key, val + 'px');
  }

  function stop() {
    for (const entry of motions) entry.cancel();
    motions = [];
  }

  function animate(item, start) {
    if (motion.matches || !item.animate) return;
    const card = item.querySelector('.track-card');
    const panel = item.querySelector('.song-sleeve');
    const finish = card.getBoundingClientRect();
    const dx = start.left - finish.left, dy = start.top - finish.top;
    const sx = start.width / finish.width, sy = start.height / finish.height;
    const shadow = getComputedStyle(card).boxShadow;
    const travel = Math.max(0, Math.min(22, Math.floor(document.documentElement.clientWidth - panel.getBoundingClientRect().right - 2)));
    const cardFrames = [{transform:'translate('+dx+'px,'+dy+'px) scale('+sx+','+sy+')', boxShadow:'0 0 0 transparent'}];
    if (fine.matches && dx > 25) {
      // Even at the right edge, begin with the same forward nudge before making room.
      const nudge = Math.max(0, Math.min(8, document.documentElement.clientWidth - start.right - 4));
      cardFrames.push({offset:.16, transform:'translate('+(dx+nudge)+'px,'+(dy+4)+'px) scale('+(1+(sx-1)*.9)+','+(1+(sy-1)*.9)+')', easing:timing, boxShadow:'0 4px 10px #44324025'});
    }
    cardFrames.push({transform:'none', boxShadow:shadow});
    motions = [
      card.animate(cardFrames, {duration:310, easing:cardFrames.length === 3 ? 'linear' : timing}),
      panel.animate([
        {transform:'translate('+travel+'px,12px)',opacity:0},
        {transform:'translate('+Math.round(travel * .32)+'px,2px)',opacity:.62,offset:.4},
        {transform:'none',opacity:1}
      ], {duration:270,delay:120,easing:timing,fill:'backwards'})
    ];
  }

  function paint(skipAnimation = false) {
    const next = pinned || (hovered !== dismissed ? hovered : null);
    if (open === next) return;
    stop();
    if (open) {
      open.removeAttribute('data-track-open');
      open.querySelector('.track-disclose').setAttribute('aria-expanded','false');
    }
    open = next;
    if (open) {
      const from = open.querySelector('.track-card').getBoundingClientRect();
      place(open, from);
      open.setAttribute('data-track-open','');
      open.querySelector('.track-disclose').setAttribute('aria-expanded','true');
      if (!skipAnimation) animate(open, from);
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
    const details = item.querySelector('.track-details');
    const panel = document.createElement('div');
    panel.className = 'song-sleeve';
    for (const key of ['title','artist']) {
      const label = document.createElement('span');
      label.className = 'song-sleeve-' + key;
      label.textContent = item.querySelector('.track-' + key).textContent;
      panel.append(label);
    }
    if (details.querySelector('.track-release')?.textContent.trim() === panel.firstChild.textContent.trim()) {
      panel.setAttribute('data-same-release','');
    }
    // The disclosure controls the original metadata ID, now inside the separate detail surface.
    panel.append(details);
    button.before(panel);
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
      }, 125);
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
  motion.addEventListener('change', stop);
  window.addEventListener('resize', () => {
    if (!open) return;
    const previous = open;
    stop();
    previous.removeAttribute('data-track-open');
    open = null;
    paint(true);
  });
})();
