import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Reveal from "../components/Reveal";
import { galleryImages } from "../mock";
import api from "../lib/api";
import { useContent } from "../context/ContentContext";
import { imageUrl } from "../lib/siteImages";
import { resolveSiteImage, responsiveImageSet } from "../components/SiteImage";

const categories = ["Всички", "Прозорци", "Врати", "Плъзгащи"];

export default function Gallery() {
  const { content } = useContent();
  const [filter, setFilter] = useState("Всички");
  const [active, setActive] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    api
      .get("/gallery")
      .then((res) => {
        if (!mounted) return;
        const uploaded = (res.data || []).map((g) => ({
          src: resolveSiteImage(g.url),
          title: g.title,
          category: g.category,
        }));
        setItems(uploaded);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  const gallerySource = [
    ...items,
    ...galleryImages.map((g, i) => ({
      ...g,
      src: resolveSiteImage(imageUrl(content, "gallery_" + i, g.src)),
    })),
  ];

  const filtered =
    filter === "Всички"
      ? gallerySource
      : gallerySource.filter((g) => g.category === filter);

  return (
    <main className="overflow-hidden pt-20">
      {/* Header */}
      <section className="arch-grid-bg relative overflow-hidden border-b border-white/10 bg-[#0e0e11]">
        <div className="pointer-events-none absolute -top-24 right-1/3 h-72 w-72 rounded-full bg-gold/10 blur-[120px]" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-24 lg:px-8">
          <Reveal className="max-w-3xl">
            <span className="section-eyebrow">Галерия</span>
            <h1 className="mt-5 font-display text-fluid-h1 font-extrabold tracking-tight text-white">
              Реализирани проекти
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
              Избрани обекти от нашето портфолио — жилищни, търговски
              и административни сгради.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-2.5 sm:gap-3" role="tablist" aria-label="Категории проекти">
          {categories.map((c) => {
            const isSelected = filter === c;
            return (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setFilter(c)}
                className={`min-h-[44px] rounded-full border px-5 py-2.5 text-sm font-semibold transition-all ${
                  isSelected
                    ? "border-gold bg-gold text-[#0a0a0b] shadow-[0_6px_22px_rgba(201,161,90,0.3)]"
                    : "glass-pill text-white/75 hover:border-gold/45 hover:text-white"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {filtered.map((g, i) => (
            <Reveal key={g.src + i} delay={(i % 3) * 80} className="mb-5 break-inside-avoid">
              <button
                type="button"
                onClick={() => setActive(g)}
                className="card-hover glass-panel group block w-full overflow-hidden rounded-2xl p-1.5 text-left"
              >
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    loading="lazy"
                    decoding="async"
                    srcSet={responsiveImageSet(g.src)}
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 360px"
                    src={g.src}
                    alt={g.title}
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle window frame border */}
                  <div className="pointer-events-none absolute inset-2.5 rounded-lg border border-white/15 opacity-75 transition-opacity group-hover:border-gold/45" />
                  <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-[#0a0a0b]/90 via-[#0a0a0b]/25 to-transparent opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100">
                    <div className="p-5 text-left">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                        {g.category}
                      </div>
                      <div className="mt-1 font-display text-base font-bold text-white sm:text-lg">
                        {g.title}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 backdrop-blur-md sm:p-6"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            aria-label="Затвори"
            className="glass-pill absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:border-gold hover:text-gold sm:right-6 sm:top-6"
            onClick={() => setActive(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="glass-panel max-w-5xl overflow-hidden rounded-3xl p-3 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={active.src}
              alt={active.title}
              className="max-h-[75vh] w-full rounded-2xl object-contain"
            />
            <div className="mt-3 px-2 pb-1 text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                {active.category}
              </div>
              <div className="mt-1 font-display text-lg font-bold text-white sm:text-xl">
                {active.title}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
