import React, { useEffect, useState } from "react";
import EditableImage from "./editable/EditableImage";
import VideoBackground from "./VideoBackground";

// Фон на hero секцията.
// - Бърз бекенд: тъмен фон -> реалната снимка -> видео (fade-in).
// - Бавен бекенд (Render "студен старт"): след 1.2 сек. показваме резервната снимка,
//   вместо празен тъмен екран.
export default function HeroBackdrop({ loaded, src, fallbackSrc }) {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (loaded) return undefined;
    const t = setTimeout(() => setShowFallback(true), 1200);
    return () => clearTimeout(t);
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

      <style>{`@keyframes heroFadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </>
  );
}
