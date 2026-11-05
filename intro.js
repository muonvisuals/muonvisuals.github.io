/* Eclipse opening. The supplied logo stays intact throughout the reveal. */
(() => {
  'use strict';
  const root = document.documentElement;
  const scene = document.getElementById('brand-intro');
  const stage = scene.querySelector('.intro-logo-stage');
  const skip = scene.querySelector('.intro-skip');
  const header = document.querySelector('.nav .wordmark');
  const main = document.querySelector('main');
  const regions = [main, document.querySelector('.nav'), document.querySelector('footer')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false, frame = 0, watchdog = 0, width = 0, started = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => value * value * (3 - 2 * value);
  function moon(progress, illumination) {
    window.dispatchEvent(new CustomEvent('muon:intro', {detail: {progress, illumination}}));
  }
  function finish(focus = true) {
    active = false;
    cancelAnimationFrame(frame);
    clearTimeout(watchdog);
    root.classList.remove('intro-running', 'intro-docking');
    root.classList.add('intro-complete');
    scene.inert = true;
    scene.setAttribute('aria-hidden', 'true');
    regions.forEach(region => { region.inert = false; });
    moon(1, 1);
    if (focus) {
      main.setAttribute('tabindex', '-1');
      main.focus({preventScroll: true});
    }
  }
  function play() {
    cancelAnimationFrame(frame);
    clearTimeout(watchdog);
    if (reduced.matches) { finish(false); return; }
    active = true;
    width = innerWidth;
    root.classList.remove('intro-complete', 'intro-docking');
    root.classList.add('intro-running');
    scene.inert = false;
    scene.removeAttribute('aria-hidden');
    regions.forEach(region => { region.inert = true; });
    stage.removeAttribute('style');
    scene.style.setProperty('--eclipse-logo', '0');
    scene.style.setProperty('--eclipse-light', '0');
    window.scrollTo({top: 0, left: 0, behavior: 'instant'});
    skip.focus({preventScroll: true});
    moon(0, 0);
    started = performance.now();
    let from = null, to = null;
    function tick(now) {
      if (!active) return;
      try {
        const elapsed = now - started;
        const illumination = ease(clamp(elapsed / 2300));
        const logo = ease(clamp((elapsed - 1000) / 1100));
        const dock = ease(clamp((elapsed - 2700) / 1100));
        scene.style.setProperty('--eclipse-logo', String(logo));
        scene.style.setProperty('--eclipse-light', String(ease(clamp(elapsed / 700))));
        if (elapsed >= 2700 && !from) {
          from = stage.getBoundingClientRect();
          to = header.getBoundingClientRect();
          stage.style.left = from.left + 'px';
          stage.style.top = from.top + 'px';
          stage.style.width = from.width + 'px';
          stage.style.height = from.height + 'px';
          stage.style.transformOrigin = '0 0';
          root.classList.add('intro-docking');
        }
        if (from) {
          stage.style.transform = `translate3d(${(to.left-from.left)*dock}px,${(to.top-from.top)*dock}px,0) scale(${1+(to.width/from.width-1)*dock},${1+(to.height/from.height-1)*dock})`;
        }
        moon(dock, illumination);
        if (elapsed >= 3800) finish();
        else frame = requestAnimationFrame(tick);
      } catch (_) { finish(); }
    }
    watchdog = setTimeout(finish, 5500);
    frame = requestAnimationFrame(tick);
  }
  skip.addEventListener('click', () => finish());
  document.addEventListener('keydown', event => {
    if (!active) return;
    if (event.key === 'Escape') { event.preventDefault(); finish(); }
    else if (event.key === 'Tab') { event.preventDefault(); skip.focus(); }
  });
  document.querySelector('.intro-replay').addEventListener('click', play);
  window.addEventListener('resize', () => { if (active && Math.abs(innerWidth-width)>50) finish(); }, {passive: true});
  window.addEventListener('pagehide', () => { if (active) finish(false); });
  reduced.addEventListener('change', () => { if (reduced.matches && active) finish(); });
  root.classList.add('intro-initialized');
  try { play(); } catch (_) { finish(); }
})();
