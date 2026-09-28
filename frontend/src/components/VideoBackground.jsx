import React, { memo, useEffect, useRef, useState } from "react";
import { getVideoBackground } from "../lib/videoBackground";

// Не пускаме видео при "намалено движение" или включен режим за икономия на данни.
function shouldSkip() {
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return true;
    if (navigator.connection?.saveData) return true;
  } catch {
    /* ignore */
  }
  return false;
}

// Видео фон за hero секцията. Слага се вътре в контейнер с "absolute inset-0".
// Ако видеото липсва / е изключено / не тръгне -> не рендира нищо и остава снимката отдолу.
function VideoBackground() {
  const [src, setSrc] = useState(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (shouldSkip()) return undefined;
    let cancelled = false;
    const start = () => {
      getVideoBackground().then((cfg) => {
        if (!cancelled && cfg?.enabled && cfg.url) setSrc(cfg.url);
      });
    };
    if (document.readyState === "complete") {
      start();
    } else {
      window.addEventListener("load", start, { once: true });
    }
    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return undefined;

    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;

    let inView = true;
    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    tryPlay();

    let io;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !document.hidden) tryPlay();
        else v.pause();
      });
      io.observe(v);
    }
    const onVisibility = () => {
      if (document.hidden) v.pause();
      else if (inView) tryPlay();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onGesture = () => tryPlay();
    window.addEventListener("touchstart", onGesture, { once: true, passive: true });
    window.addEventListener("click", onGesture, { once: true });

    return () => {
      if (io) io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("click", onGesture);
    };
  }, [src]);

  if (!src || failed) return null;

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setReady(true)}
      onError={() => setFailed(true)}
      className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}

export default memo(VideoBackground);
