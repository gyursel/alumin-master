import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Reveal from "../components/Reveal";
import SiteImage from "../components/SiteImage";
import { products } from "../mock";

export default function ProductDetail() {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);
  const others = products.filter((p) => p.slug !== slug).slice(0, 3);

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-5 pt-24 text-center">
        <h1 className="font-display text-3xl font-bold">Продуктът не е намерен</h1>
        <Link to="/products" className="btn-gold mt-6 rounded-md px-7 py-3.5">
          Към продуктите
        </Link>
      </main>
    );
  }

  return (
    <main className="overflow-hidden pt-24">
      {/* Hero */}
      <section className="relative min-h-[62vh] overflow-hidden">
        <SiteImage slot={"product_"+product.slug} fallback={product.image} alt={product.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/70 to-[#0a0a0b]/40" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-14 pt-32 lg:px-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" /> Всички продукти
          </Link>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {product.title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Reveal>
              <p className="text-xl leading-relaxed text-white/75">{product.description}</p>
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {product.highlights.map((h, i) => (
                <Reveal key={h.title} delay={i * 90}>
                  <div className="h-full rounded-2xl border border-white/10 bg-[#121214] p-6">
                    <div className="font-display text-lg font-semibold text-gold">{h.title}</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{h.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={120}>
            <div className="rounded-2xl border border-white/10 bg-[#121214] p-7">
              <h3 className="font-display text-lg font-semibold">Особености</h3>
              <ul className="mt-5 space-y-3">
                {product.tags.map((t) => (
                  <li key={t} className="flex items-center gap-3 text-sm text-white/75">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full tint-gold">
                      <Check className="h-3 w-3 text-gold" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="btn-gold mt-7 flex items-center justify-center gap-2 rounded-md px-5 py-3.5">
                Заявете оферта
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Other products */}
      <section className="border-t border-white/10 bg-[#0e0e10]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Други продукти
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {others.map((p, i) => (
              <Reveal key={p.slug} delay={i * 90}>
                <Link
                  to={`/products/${p.slug}`}
                  className="card-hover group block overflow-hidden rounded-2xl border border-white/10 bg-[#121214]"
                >
                  <div className="relative h-48 overflow-hidden">
                    <SiteImage
                      slot={"product_"+p.slug} fallback={p.image}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-base font-semibold">{p.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-white/55">{p.short}</p>
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
