(() => {
  document.querySelectorAll('[data-demo-player]').forEach((player) => {
    const launch = player.querySelector('.demo-launch');
    const screen = player.querySelector('.demo-screen');
    const close = player.querySelector('.demo-close');
    const status = player.querySelector('.demo-status');
    if (!launch || !screen || !close || !status) return;

    if (['ayywl.top', 'www.ayywl.top'].includes(location.hostname) && launch.dataset.demoLocalSrc) {
      launch.href = launch.dataset.demoLocalSrc;
    }

    let activeVideo;

    const restore = (message = '') => {
      if (!activeVideo) return;
      const video = activeVideo;
      activeVideo = undefined;
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.remove();
      screen.hidden = true;
      launch.hidden = false;
      status.textContent = message;
      launch.focus({preventScroll:true});
    };

    launch.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const video = document.createElement('video');
      if (typeof video.play !== 'function' || !video.canPlayType('video/mp4')) return;
      event.preventDefault();
      if (activeVideo) return;

      activeVideo = video;
      video.controls = true;
      video.playsInline = true;
      video.preload = 'none';
      video.tabIndex = 0;
      video.setAttribute('aria-label', launch.dataset.demoLabel || launch.textContent.trim());
      video.addEventListener('error', () => {
        if (activeVideo === video) restore('视频暂时无法播放，请稍后重试。');
      });

      screen.prepend(video);
      status.textContent = '';
      launch.hidden = true;
      screen.hidden = false;
      video.src = launch.href;
      video.focus({preventScroll:true});
      video.play().catch(() => {
        if (activeVideo === video && !video.error && video.paused) status.textContent = '请使用播放器的播放按钮。';
      });
      video.addEventListener('playing', () => {
        if (activeVideo === video) status.textContent = '';
      });
    });

    close.addEventListener('click', () => restore());
    screen.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !document.fullscreenElement) {
        event.preventDefault();
        restore();
      }
    });
  });
})();
