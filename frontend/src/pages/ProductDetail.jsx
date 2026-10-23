import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Reveal from "../components/Reveal";
import SiteImage from "../components/SiteImage";
import { products } from "../mock";

function handleTiltMove(e) {
  if (typeof window !== "undefined" && !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const px = (e.clientX - rect.left) / rect.width;
  const py = (e.clientY - rect.top) / rect.height;
  const rx = (0.5 - py) * 6;
  const ry = (px - 0.5) * 7;
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

export default function ProductDetail() {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);
  const others = products.filter((p) => p.slug !== slug).slice(0, 3);

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-5 pt-24 text-center">
        <h1 className="font-display text-3xl font-bold text-white">Продуктът не е намерен</h1>
        <Link to="/products" className="btn-gold mt-6 inline-flex min-h-[48px] items-center rounded-xl px-7 py-3.5 text-sm">
          Към продуктите
        </Link>
      </main>
    );
  }

  return (
    <main className="overflow-hidden pt-20">
      {/* Hero */}
      <section className="relative flex min-h-[56vh] items-end overflow-hidden border-b border-white/10 sm:min-h-[62vh]">
        <SiteImage
          slot={"product_" + product.slug}
          fallback={product.image}
          alt={product.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/75 to-[#0a0a0b]/35" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a0a0b]/85 via-transparent to-transparent" />
        {/* Architectural frame accent */}
        <div className="pointer-events-none absolute inset-x-5 bottom-0 top-6 hidden rounded-t-3xl border-x border-t border-white/10 lg:inset-x-8 lg:block" />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-end px-5 pb-12 pt-28 sm:pb-16 lg:px-8">
          <Link
            to="/products"
            className="glass-pill inline-flex min-h-[40px] w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider text-white/75 transition-colors hover:border-gold/50 hover:text-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Всички продукти
          </Link>
          <h1 className="mt-5 max-w-3xl font-display text-fluid-h1 font-extrabold tracking-tight text-white">
            {product.title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8">
            <Reveal>
              <div className="glass-panel rounded-3xl p-6 sm:p-9">
                <p className="text-lg leading-relaxed text-white/80 sm:text-xl">
                  {product.description}
                </p>
              </div>
            </Reveal>

            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {product.highlights.map((h, i) => (
                <Reveal key={h.title} delay={i * 90}>
                  <div
                    onMouseMove={handleTiltMove}
                    onMouseLeave={handleTiltLeave}
                    className="card-hover glass-panel relative h-full overflow-hidden rounded-2xl p-6"
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/55 to-transparent" />
                    <span className="font-display text-xs font-bold uppercase tracking-widest text-white/30">
                      0{i + 1}
                    </span>
                    <div className="mt-2 font-display text-lg font-bold text-gold">{h.title}</div>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/65">{h.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={120} className="lg:col-span-4">
            <div className="glass-panel-gold sticky top-28 rounded-3xl p-7 sm:p-8">
              <h3 className="font-display text-xl font-bold text-white">Особености</h3>
              <ul className="mt-6 space-y-3.5">
                {product.tags.map((t) => (
                  <li key={t} className="flex items-center gap-3.5 rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5 text-sm text-white/85">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full tint-gold">
                      <Check className="h-3 w-3 text-gold" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className="btn-gold mt-7 flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm"
              >
                Заявете оферта
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Other products */}
      <section className="arch-grid-bg border-t border-white/10 bg-[#0e0e11]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-24 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Други продукти
            </h2>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-white"
            >
              Виж всички <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p, i) => (
              <Reveal key={p.slug} delay={i * 90}>
                <Link
                  to={`/products/${p.slug}`}
                  onMouseMove={handleTiltMove}
                  onMouseLeave={handleTiltLeave}
                  className="card-hover glass-panel group flex h-full flex-col overflow-hidden rounded-2xl"
                >
                  <div className="relative h-52 overflow-hidden">
                    <SiteImage
                      slot={"product_" + p.slug}
                      fallback={p.image}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/20 to-transparent" />
                    <div className="pointer-events-none absolute inset-2.5 rounded-xl border border-white/15" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h3 className="font-display text-lg font-bold text-white transition-colors group-hover:text-gold">
                        {p.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/60">
                        {p.short}
                      </p>
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
                      Научете повече
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
