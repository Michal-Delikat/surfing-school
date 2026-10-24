export function initHeroVideo() {
  const video = document.getElementById("hero-video");
  const toggle = document.getElementById("video-toggle");
  if (!video || !toggle) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = window.matchMedia("(max-width: 899px)");
  const connection =
    navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;

  const pauseIcon = toggle.querySelector('[data-video-icon="pause"]');
  const playIcon = toggle.querySelector('[data-video-icon="play"]');
  const label = toggle.querySelector("[data-video-label]");

  let loaded = false;
  let userPaused = false;
  let pausedByView = false;

  video.disablePictureInPicture = true;
  if ("disableRemotePlayback" in video) video.disableRemotePlayback = true;

  const syncToggle = () => {
    const playing = !video.paused && !video.ended;
    if (pauseIcon) pauseIcon.hidden = !playing;
    if (playIcon) playIcon.hidden = playing;
    if (label) label.textContent = playing ? "Zatrzymaj tło" : "Włącz tło";
  };

  const canLoad = () => {
    if (reduceMotion.matches || mobile.matches) return false;
    if (connection && connection.saveData) return false;
    if (connection && ["slow-2g", "2g", "3g"].includes(connection.effectiveType)) {
      return false;
    }
    return true;
  };

  const revealVideo = () => {
    video.classList.add("is-ready");
    toggle.hidden = false;
    syncToggle();
  };

  const startPlayback = () => {
    if (!loaded || userPaused) return;
    const playPromise = video.play();
    if (playPromise) playPromise.catch(() => {});
  };

  const loadVideo = () => {
    if (loaded || !canLoad()) return;
    loaded = true;

    const height = window.innerWidth < 1100 ? 720 : 1080;
    const sources = [
      { src: `assets/video/hero-${height}.webm`, type: "video/webm" },
      { src: `assets/video/hero-${height}.mp4`, type: "video/mp4" },
    ];

    for (const source of sources) {
      const element = document.createElement("source");
      element.src = source.src;
      element.type = source.type;
      video.append(element);
    }

    video.poster = "assets/img/hero-poster-1200.jpg";
    video.load();
    startPlayback();
  };

  video.addEventListener("canplay", revealVideo, { once: true });
  video.addEventListener("playing", revealVideo);
  video.addEventListener("play", syncToggle);
  video.addEventListener("pause", syncToggle);
  video.addEventListener("error", () => {
    video.classList.remove("is-ready");
    toggle.hidden = true;
  });

  toggle.addEventListener("click", () => {
    if (video.paused) {
      userPaused = false;
      pausedByView = false;
      startPlayback();
    } else {
      userPaused = true;
      video.pause();
    }
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!loaded) return;
      if (!entry.isIntersecting && !video.paused) {
        pausedByView = true;
        video.pause();
      } else if (entry.isIntersecting && pausedByView && !userPaused) {
        pausedByView = false;
        startPlayback();
      }
    },
    { threshold: 0.15 },
  );
  observer.observe(video);

  reduceMotion.addEventListener("change", (event) => {
    if (event.matches) {
      video.pause();
      video.classList.remove("is-ready");
      toggle.hidden = true;
    } else {
      if (!loaded) loadVideo();
      if (loaded) {
        video.classList.add("is-ready");
        toggle.hidden = false;
        startPlayback();
      }
    }
  });

  mobile.addEventListener("change", () => {
    if (mobile.matches) {
      video.pause();
      video.classList.remove("is-ready");
      toggle.hidden = true;
    } else if (loaded) {
      video.classList.add("is-ready");
      toggle.hidden = false;
      startPlayback();
    }
  });

  const scheduleLoad = () => {
    if (!canLoad()) return;
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadVideo, { timeout: 2200 });
    } else {
      window.setTimeout(loadVideo, 900);
    }
  };

  if (document.readyState === "complete") {
    scheduleLoad();
  } else {
    window.addEventListener("load", scheduleLoad, { once: true });
  }
}
