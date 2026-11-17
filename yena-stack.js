(() => {
  const stack = document.querySelector('.yena-stack');
  if (!stack) return;
  const pairs = [...stack.querySelectorAll('.yena-hit')].map(hit => ({
    hit, print:document.getElementById(hit.dataset.photo)
  })).filter(item => item.print);
  if (!pairs.length) return;
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  let order = pairs.slice();
  let pointerBlock = false;
  const select = () => order.forEach(({hit,print},i) => {
    hit.dataset.slot = print.dataset.slot = String(i+1);
    hit.setAttribute('aria-pressed',String(i===0));
  });
  const pop = pair => pairs.forEach(item => item.print.toggleAttribute('data-pop',item===pair));
  for (const pair of pairs) {
    pair.hit.hidden = false;
    pair.hit.addEventListener('pointerenter', () => { if (fine.matches && !pointerBlock) pop(pair); });
    pair.hit.addEventListener('pointerleave', () => {
      if (!pointerBlock && pair.hit.matches(':focus-visible')) return;
      pop(null);
    });
    pair.hit.addEventListener('focus', () => { if (pair.hit.matches(':focus-visible')) pop(pair); });
    pair.hit.addEventListener('blur', () => pop(null));
    pair.hit.addEventListener('click', event => {
      if (order[0]===pair) return;
      pointerBlock = event.detail > 0;
      pop(null);
      order = [pair,...order.filter(item => item!==pair)];
      select();
    });
  }
  stack.addEventListener('pointermove',() => {
    if (!pointerBlock) return;
    pointerBlock = false;
  });
  select();
})();