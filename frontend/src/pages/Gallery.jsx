import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Reveal from "../components/Reveal";
import { galleryImages } from "../mock";
import api, { API } from "../lib/api";
import { useContent } from "../context/ContentContext";
import { imageUrl } from "../lib/siteImages";
import { resolveSiteImage, responsiveImageSet } from "../components/SiteImage";

const categories = ["Всички", "Прозорци", "Врати", "Плъзгащи"];

export default function Gallery() {
  const {content}=useContent();
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

  const gallerySource = [...items, ...galleryImages.map((g,i)=>({...g,src:resolveSiteImage(imageUrl(content,"gallery_"+i,g.src))}))];

  const filtered =
    filter === "Всички"
      ? gallerySource
      : gallerySource.filter((g) => g.category === filter);

  return (
    <main className="overflow-hidden pt-24">
      <section className="border-b border-white/10 bg-[#0e0e10]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <Reveal className="max-w-3xl">
            <span className="section-eyebrow">Галерия</span>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Реализирани проекти
            </h1>
            <p className="mt-5 text-lg text-white/60">
              Избрани обекти от нашето портфолио — жилищни, търговски
              и административни сгради.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full border px-5 py-2 text-sm font-medium transition-all ${
                filter === c
                  ? "border-gold bg-gold text-[#0a0a0b]"
                  : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {filtered.map((g, i) => (
            <Reveal key={g.src + i} delay={(i % 3) * 80} className="mb-5 break-inside-avoid">
              <button
                onClick={() => setActive(g)}
                className="card-hover group block w-full overflow-hidden rounded-2xl border border-white/10"
              >
                <div className="relative">
                  <img
                    loading="lazy"
                    decoding="async"
                    srcSet={responsiveImageSet(g.src)}
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 360px"
                    src={g.src}
                    alt={g.title}
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#0a0a0b]/85 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="p-5 text-left">
                      <div className="text-xs uppercase tracking-widest text-gold">{g.category}</div>
                      <div className="mt-1 font-display text-lg font-semibold">{g.title}</div>
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-5 backdrop-blur-sm"
          onClick={() => setActive(null)}
        >
          <button
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-gold hover:text-gold"
            onClick={() => setActive(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img src={active.src} alt={active.title} className="max-h-[80vh] w-full rounded-xl object-contain" />
            <div className="mt-4 text-center">
              <div className="text-xs uppercase tracking-widest text-gold">{active.category}</div>
              <div className="mt-1 font-display text-xl font-semibold">{active.title}</div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
