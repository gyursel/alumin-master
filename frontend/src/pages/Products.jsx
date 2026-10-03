import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import Reveal from "../components/Reveal";
import SiteImage from "../components/SiteImage";
import { products } from "../mock";

export default function Products() {
  return (
    <main className="overflow-hidden pt-24">
      {/* Header */}
      <section className="relative border-b border-white/10 bg-[#0e0e10]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <Reveal className="max-w-3xl">
            <span className="section-eyebrow">Нашите продукти</span>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Пълна гама алуминиеви системи
            </h1>
            <p className="mt-5 text-lg text-white/60">
              Предлагаме комплексни решения за всеки вид обект — от
              жилищен дом до мащабна търговска сграда.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Product rows */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="space-y-20 lg:space-y-28">
          {products.map((p, i) => (
            <Reveal key={p.slug}>
              <div
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="group relative overflow-hidden rounded-2xl border border-white/10">
                  <SiteImage
                    slot={"product_"+p.slug} fallback={p.image}
                    alt={p.title}
                    className="h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/60 to-transparent" />
                </div>
                <div>
                  <span className="section-eyebrow">0{i + 1}</span>
                  <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    {p.title}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-white/60">
                    {p.description}
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {p.tags.map((t) => (
                      <div key={t} className="flex items-center gap-2.5 text-sm text-white/75">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full tint-gold">
                          <Check className="h-3 w-3 text-gold" />
                        </span>
                        {t}
                      </div>
                    ))}
                  </div>
                  <Link
                    to={`/products/${p.slug}`}
                    className="btn-gold mt-8 inline-flex items-center gap-2 rounded-md px-7 py-3.5"
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
