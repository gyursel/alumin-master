import React, { useEffect, useState } from "react";
import EditableImage from "./editable/EditableImage";
import VideoBackground from "./VideoBackground";

// Фон на hero секцията.
// - Бърз бекенд: тъмен фон -> реалната снимка -> видео (fade-in), както преди.
// - Бавен бекенд (Render "студен старт"): след 1.2 сек. показваме резервната снимка,
//   а след 5 сек. и малко съобщение, вместо празен тъмен екран.
export default function HeroBackdrop({ loaded, src, fallbackSrc }) {
  const [showFallback, setShowFallback] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (loaded) return undefined;
    const t1 = setTimeout(() => setShowFallback(true), 1200);
    const t2 = setTimeout(() => setShowHint(true), 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loaded]);

  return (
    <>
      {loaded ? (
        <EditableImage
          src={src}
          path="sections.hero.image"
          alt="Алуминиева фасада"
          className="h-full w-full object-cover"
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-[#0a0a0b]" />
          {showFallback && (
            <img
              src={fallbackSrc}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ animation: "heroFadeIn 700ms ease-out both" }}
            />
          )}
        </>
      )}

      <VideoBackground />

      {!loaded && showHint && (
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 text-sm text-white/60">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[var(--gold)]" />
          Сървърът се събужда, моля изчакайте...
        </div>
      )}

      <style>{`@keyframes heroFadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </>
  );
}
