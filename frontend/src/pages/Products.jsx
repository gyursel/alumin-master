import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import Reveal from "../components/Reveal";
import SiteImage from "../components/SiteImage";
import { products } from "../mock";

function handleTiltMove(e) {
  if (typeof window !== "undefined" && !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const px = (e.clientX - rect.left) / rect.width;
  const py = (e.clientY - rect.top) / rect.height;
  const rx = (0.5 - py) * 5;
  const ry = (px - 0.5) * 6;
  el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
  el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
  el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
  el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
}

function handleTiltLeave(e) {
  const el = e.currentTarget;
  el.style.setProperty("--rx", "0deg");
  el.style.setProperty("--ry", "0deg");
}

export default function Products() {
  return (
    <main className="overflow-hidden pt-20">
      {/* Header */}
      <section className="arch-grid-bg relative overflow-hidden border-b border-white/10 bg-[#0e0e11]">
        <div className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-gold/10 blur-[120px]" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-24 lg:px-8">
          <Reveal className="max-w-3xl">
            <span className="section-eyebrow">Нашите продукти</span>
            <h1 className="mt-5 font-display text-fluid-h1 font-extrabold tracking-tight text-white">
              Пълна гама алуминиеви системи
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
              Предлагаме комплексни решения за всеки вид обект — от
              жилищен дом до мащабна търговска сграда.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Product rows */}
      <section className="relative mx-auto max-w-7xl px-5 py-16 sm:py-24 lg:px-8">
        <div className="space-y-16 sm:space-y-24 lg:space-y-28">
          {products.map((p, i) => (
            <Reveal key={p.slug}>
              <div
                onMouseMove={handleTiltMove}
                onMouseLeave={handleTiltLeave}
                className={`card-hover glass-panel grid items-center gap-8 rounded-3xl p-5 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-10 ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="arch-frame-corners group relative overflow-hidden rounded-2xl border border-white/15 bg-[#0a0a0b] p-2 shadow-2xl lg:col-span-6">
                  <div className="relative overflow-hidden rounded-xl">
                    <SiteImage
                      slot={"product_" + p.slug}
                      fallback={p.image}
                      alt={p.title}
                      className="h-[280px] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-[360px] lg:h-[420px]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/75 via-[#0a0a0b]/15 to-transparent" />
                    {/* Subtle window mullion frame lines */}
                    <div className="pointer-events-none absolute inset-3 rounded-lg border border-white/15" />
                    <span className="pointer-events-none absolute left-5 top-5 rounded-full border border-white/15 bg-[#0a0a0b]/80 px-3.5 py-1 font-display text-xs font-bold tracking-widest text-gold backdrop-blur-md">
                      0{i + 1}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <span className="section-eyebrow">0{i + 1}</span>
                  <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                    {p.title}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-white/65 sm:text-lg">
                    {p.description}
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {p.tags.map((t) => (
                      <div
                        key={t}
                        className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-3.5 py-2.5 text-sm text-white/80"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full tint-gold">
                          <Check className="h-3 w-3 text-gold" />
                        </span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    to={`/products/${p.slug}`}
                    className="btn-gold mt-8 inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 text-sm sm:w-auto"
                  >
                    Разгледайте
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
