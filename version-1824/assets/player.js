import { H as Hls } from './hls.js';

const players = Array.from(document.querySelectorAll('[data-player]'));

players.forEach((video) => {
  const shell = video.closest('[data-player-shell]');
  const button = shell?.querySelector('[data-player-start]');
  const errorBox = shell?.querySelector('[data-player-error]');
  const source = video.dataset.src;
  let hls = null;

  const showError = (message) => {
    if (errorBox) {
      errorBox.hidden = false;
      errorBox.textContent = message;
    }
  };

  const bindSource = () => {
    if (!source) {
      showError('视频加载失败，请刷新页面重试');
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data && data.fatal) {
          showError('视频加载失败，请刷新页面重试');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      showError('当前浏览器不支持此视频播放');
    }
  };

  const playVideo = () => {
    if (!video.src && !hls) {
      bindSource();
    }
    const result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(() => {
        showError('点击播放器后可继续播放');
      });
    }
  };

  bindSource();

  button?.addEventListener('click', playVideo);

  video.addEventListener('click', () => {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', () => {
    shell?.classList.add('is-playing');
  });

  video.addEventListener('pause', () => {
    shell?.classList.remove('is-playing');
  });

  window.addEventListener('beforeunload', () => {
    if (hls) {
      hls.destroy();
    }
  });
});
