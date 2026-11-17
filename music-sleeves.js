(() => {
  const shelf = document.querySelector('.music-shelf');
  if (!shelf) return;
  const items = [...shelf.querySelectorAll('.track-item')];
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const gutter = 18;
  let open = null, pinned = null, hovered = null, dismissed = null, timer, frame;

  function place(item) {
    const anchor = item.querySelector('.track-body').getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    const side = fine.matches && !reduced.matches && viewport >= 990;
    const centerX = anchor.left + anchor.width / 2, centerY = anchor.top + anchor.height / 2;
    const width = side ? Math.min(340, Math.round(viewport * .25)) : Math.min(320, viewport - 2 * gutter);
    const gap = 7, depth = side ? 80 : 0, projection = 820 / (820 - depth), tilt = 3.2 * Math.PI / 180;
    const tall = anchor.height >= 225;
    const songWidth = anchor.width * (tall ? .95 : 1);
    const scale = side ? songWidth / (anchor.width * projection) : 1;
    const half = songWidth * (Math.cos(tilt) + Math.sin(tilt) * anchor.height / anchor.width) / 2;
    const halfHeight = songWidth * anchor.height / anchor.width / 2;
    // The original slot stays fixed; the moving pair docks within the viewport.
    const launchX = side ? Math.max(gutter + half, Math.min(centerX - 115, viewport - gutter - width - gap - half - 17)) : centerX;
    const launchY = side ? Math.max(103 + halfHeight, Math.min(centerY - (tall ? 17 : 30), innerHeight - 24 - halfHeight)) : centerY;
    const dx = launchX - centerX, dy = launchY - centerY;
    const x = side ? launchX + half + gap : Math.min(Math.max(gutter, anchor.left), viewport - gutter - width);
    // Align the two upper corners on either side of the seam, not their bounding-box centers.
    const songInnerTop = launchY - halfHeight * Math.cos(tilt) - (songWidth / 2) * Math.sin(tilt);
    const clearance = items.indexOf(item) < 2 ? 7 : 0;
    const top = side ? songInnerTop + clearance - anchor.top : Math.ceil(anchor.height + 10);
    item.toggleAttribute('data-sleeve-side', side);
    item.style.setProperty('--sleeve-scale', scale.toFixed(4));
    for (const [key, val] of Object.entries({
      'sleeve-shift':dx/projection, 'sleeve-lift':dy/projection, 'sleeve-depth':depth,
      'sleeve-button-x':Math.round(dx + (songWidth - anchor.width) / 2),
      'sleeve-button-y':Math.round(dy + (anchor.height - 2 * halfHeight) / 2 - 7),
      'sleeve-left':Math.round(x - anchor.left), 'sleeve-width':width, 'sleeve-top':Math.round(top),
      'sleeve-travel':side ? Math.max(0,Math.min(38, viewport - x - width - 3)) : 0,
      'sleeve-rise':side ? -5 : 10,
      'sleeve-shadow-left':Math.round(launchX - half - anchor.left),
      'sleeve-shadow-top':Math.round(launchY + Math.max(80,halfHeight) - anchor.top - 3),
      'sleeve-shadow-width':Math.round(width + 2 * half + gap)
    })) item.style.setProperty('--' + key, val + 'px');
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

  function updatePlacement() {
    if (!open || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!open) return;
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
    const profile = item.querySelector('.song-sleeve');
    const contents = document.createElement('div');
    const name = document.createElement('strong');
    name.className = 'song-sleeve-name';
    name.textContent = item.querySelector('.track-artist').textContent.replace('（娅娅）', '');
    const heading = profile.querySelector('.song-sleeve-heading');
    contents.append(heading, name, ...profile.querySelectorAll('p,.song-sleeve-credit'));
    profile.append(contents);
    button.setAttribute('aria-label', item.querySelector('.track-title').textContent + '，艺人档案');
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
