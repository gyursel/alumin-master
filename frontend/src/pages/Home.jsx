import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ShieldCheck,
  Wrench,
  BadgeCheck,
  Headset,
  Star,
  ChevronDown,
} from "lucide-react";
import Reveal from "../components/Reveal";
import SiteImage from "../components/SiteImage";
import { useContent } from "../context/ContentContext";
import EditableText from "../components/editable/EditableText";
import EditableImage from "../components/editable/EditableImage";
import SectionWrap from "../components/editable/SectionWrap";
import HeroBackdrop from "../components/HeroBackdrop";
import {
  heroImage,
  stats as mockStats,
  products,
  advantages,
  features,
  process,
  testimonials,
  brands,
  aboutImages,
  company,
} from "../mock";

const iconMap = { ShieldCheck, Wrench, BadgeCheck, Headset };

const DEFAULTS = {
  hero: {
    visible: true,
    eyebrow: "Производство и монтаж",
    titleLine1: "Алуминиева",
    titleLead: "дограма от ",
    titleAccent: "профи",
    subtitle:
      "Прозорци и врати с европейско качество. Собствено производство, монтаж и 3-годишна гаранция.",
    image: heroImage,
  },
  stats: { visible: true, items: mockStats },
  products: {
    visible: true,
    eyebrow: "Нашите продукти",
    heading: "Пълна гама алуминиеви системи",
    subtitle:
      "Предлагаме комплексни решения за жилищно и търговско строителство — от единичен прозорец до цялостна фасада.",
  },
  why: {
    visible: true,
    eyebrow: "Защо ние",
    heading: "Качество, на което можете да разчитате",
    text:
      "Дограма Добрич предлага алуминиева дограма, изработена по поръчка и монтирана професионално – от измерването до финалния монтаж.",
    image: aboutImages.main,
  },
  features: { visible: true, eyebrow: "Нашите предимства", heading: "Пълно обслужване от А до Я" },
  process: { visible: true, eyebrow: "Как работим", heading: "Процес в 5 прости стъпки" },
  testimonials: { visible: true, eyebrow: "Клиентите за нас", heading: "Доверени от 2500+ клиента" },
  brands: { visible: true },
  cta: {
    visible: true,
    heading: "Готови да обновите своя дом или офис?",
    subtitle:
      "Свържете се с нас за безплатна консултация и оферта. Нашите специалисти ще посетят обекта и ще ви предложат най-подходящото решение.",
  },
};

function canUseFineHover() {
  try {
    return (
      window.matchMedia?.("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    );
  } catch {
    return false;
  }
}

export default function Home() {
  const { content, loaded, editMode } = useContent();
  const sec = (key) => (content?.sections?.[key] ? content.sections[key] : DEFAULTS[key]);

  const hero = sec("hero");
  const stats = sec("stats");
  const prod = sec("products");
  const why = sec("why");
  const feat = sec("features");
  const proc = sec("process");
  const tst = sec("testimonials");
  const brd = sec("brands");
  const cta = sec("cta");

  const handleCardMove = (e) => {
    if (editMode || !canUseFineHover()) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - y) * 3.2).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((x - 0.5) * 4.2).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
  };

  const handleCardLeave = (e) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <main className="overflow-hidden">
      {/* HERO */}
      <section className="relative flex min-h-[100svh] items-center pb-20 pt-28 lg:py-32">
        <div className="absolute inset-0">
          <HeroBackdrop loaded={loaded} src={hero.image} fallbackSrc={DEFAULTS.hero.image} />
          {/* Precision architectural contrast overlays */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#0a0a0c]/88 to-[#0a0a0c]/38" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/20 to-[#0a0a0b]/70" />
          {/* Subtle architectural mullion frame lines */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 inset-y-24 hidden rounded-3xl border border-white/[0.06] lg:block"
          >
            <div className="absolute inset-y-0 right-[34%] w-px bg-gradient-to-b from-transparent via-white/[0.07] to-transparent" />
            <div className="absolute inset-x-0 bottom-24 h-px bg-gradient-to-r from-white/[0.06] via-gold/20 to-transparent" />
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 lg:px-8">
          <div className="grid items-end gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Reveal>
                <div className="inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-[#121216]/80 px-4 py-1.5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                  <EditableText
                    as="span"
                    className="section-eyebrow"
                    value={hero.eyebrow}
                    path="sections.hero.eyebrow"
                  />
                </div>
              </Reveal>

              <Reveal delay={100}>
                <h1 className="mt-6 font-display text-[clamp(2.4rem,5.4vw,4.75rem)] font-extrabold leading-[1.04] tracking-tight text-white">
                  <EditableText
                    as="span"
                    className="block"
                    value={hero.titleLine1}
                    path="sections.hero.titleLine1"
                  />
                  <span className="mt-1 block">
                    <EditableText
                      as="span"
                      value={hero.titleLead}
                      path="sections.hero.titleLead"
                    />
                    <EditableText
                      as="span"
                      className="text-gradient-gold"
                      value={hero.titleAccent}
                      path="sections.hero.titleAccent"
                    />
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={200}>
                <EditableText
                  as="p"
                  className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
                  value={hero.subtitle}
                  path="sections.hero.subtitle"
                />
              </Reveal>

              <Reveal delay={300}>
                <div className="mt-9 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                  <Link
                    to="/contact"
                    className="btn-gold group flex min-h-[50px] items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 text-base"
                  >
                    <span>Безплатна консултация</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/products"
                    className="btn-ghost glass-pill flex min-h-[50px] items-center justify-center rounded-xl px-7 py-3.5 text-base"
                  >
                    Вижте продуктите
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Decorative architectural glass specification frame on desktop */}
            <div className="pointer-events-none hidden lg:col-span-4 lg:block" aria-hidden="true">
              <Reveal delay={260}>
                <div className="glass-panel relative overflow-hidden rounded-2xl p-6">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/85">
                    <span>Профилни системи</span>
                    <span>EU Стандарт</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {brands.map((b) => (
                      <span
                        key={b}
                        className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-display text-xs font-semibold text-white/85"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                  <div className="my-4 h-px bg-white/10" />
                  <div className="space-y-2.5">
                    {advantages.slice(0, 3).map((adv) => (
                      <div key={adv} className="flex items-center gap-2.5 text-xs text-white/70">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full tint-gold">
                          <Check className="h-2.5 w-2.5 text-gold" />
                        </span>
                        <span>{adv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 text-white/45">
          <span className="text-[10px] font-medium uppercase tracking-[0.26em]">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce text-gold/80" />
        </div>
      </section>

      {/* STATS */}
      <SectionWrap path="sections.stats" visible={stats.visible} label="Статистики">
        <section className="relative border-y border-white/10 bg-[#0d0d10]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 py-12 sm:gap-6 lg:grid-cols-4 lg:px-8 lg:py-16">
            {(stats.items || mockStats).map((s, i) => (
              <Reveal
                key={i}
                delay={i * 80}
                className="glass-panel relative overflow-hidden rounded-2xl px-5 py-6 text-center sm:px-6 sm:py-7"
              >
                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent" />
                <EditableText
                  as="div"
                  className="font-display tabular-nums text-3xl font-extrabold text-gradient-gold sm:text-4xl lg:text-5xl"
                  value={s.value}
                  path={`sections.stats.items.${i}.value`}
                />
                <EditableText
                  as="div"
                  className="mt-2.5 text-xs font-medium uppercase tracking-[0.16em] text-white/65 sm:text-sm"
                  value={s.label}
                  path={`sections.stats.items.${i}.label`}
                />
              </Reveal>
            ))}
          </div>
        </section>
      </SectionWrap>

      {/* PRODUCTS */}
      <SectionWrap path="sections.products" visible={prod.visible} label="Продукти">
        <section className="arch-grid-bg relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <Reveal className="relative z-10 max-w-2xl">
            <EditableText
              as="span"
              className="section-eyebrow"
              value={prod.eyebrow}
              path="sections.products.eyebrow"
            />
            <EditableText
              as="h2"
              className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
              value={prod.heading}
              path="sections.products.heading"
            />
            <EditableText
              as="p"
              className="mt-4 text-base leading-relaxed text-white/65 sm:text-lg"
              value={prod.subtitle}
              path="sections.products.subtitle"
            />
          </Reveal>

          <div className="relative z-10 mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
            {products.slice(0, 4).map((p, i) => (
              <Reveal key={p.slug} delay={i * 90}>
                <Link
                  to={`/products/${p.slug}`}
                  onPointerMove={handleCardMove}
                  onPointerLeave={handleCardLeave}
                  className="card-hover group flex h-full flex-col overflow-hidden rounded-2xl"
                >
                  <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#0e0e12]">
                    <SiteImage
                      slot={"product_" + p.slug}
                      fallback={p.image}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121216] via-[#121216]/20 to-transparent" />
                    <span className="glass-pill pointer-events-none absolute left-3.5 top-3.5 rounded-lg px-2.5 py-1 font-display text-xs font-semibold text-gold-light">
                      0{i + 1}
                    </span>
                  </div>
                  <div className="relative z-10 flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h3 className="font-display text-lg font-bold tracking-tight text-white transition-colors group-hover:text-gold-light">
                        {p.title}
                      </h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-white/60">{p.short}</p>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-4">
                      <span className="text-sm font-semibold text-gold">Научете повече</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal className="relative z-10 mt-12 text-center">
            <Link
              to="/products"
              className="btn-ghost glass-pill inline-flex min-h-[48px] items-center gap-2.5 rounded-xl px-7 py-3.5"
            >
              <span>Всички продукти</span>
              <ArrowRight className="h-4 w-4 text-gold" />
            </Link>
          </Reveal>
        </section>
      </SectionWrap>

      {/* WHY US */}
      <SectionWrap path="sections.why" visible={why.visible} label="Защо ние">
        <section className="relative border-y border-white/10 bg-[#0d0d10]">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-28">
            <Reveal className="lg:col-span-6">
              <EditableText
                as="span"
                className="section-eyebrow"
                value={why.eyebrow}
                path="sections.why.eyebrow"
              />
              <EditableText
                as="h2"
                className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                value={why.heading}
                path="sections.why.heading"
              />
              <EditableText
                as="p"
                className="mt-4 text-base leading-relaxed text-white/65 sm:text-lg"
                value={why.text}
                path="sections.why.text"
              />
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {advantages.map((a) => (
                  <li
                    key={a}
                    className="glass-pill flex items-start gap-3 rounded-xl px-3.5 py-3 text-sm text-white/80"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full tint-gold">
                      <Check className="h-3 w-3 text-gold" />
                    </span>
                    <span className="leading-snug">{a}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/about"
                className="btn-gold mt-9 inline-flex min-h-[48px] items-center gap-2.5 rounded-xl px-7 py-3.5"
              >
                <span>За нас</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>

            <Reveal delay={150} className="relative lg:col-span-6">
              <div className="arch-frame-corners relative h-[380px] overflow-hidden rounded-2xl border border-white/12 shadow-[0_28px_70px_-20px_rgba(0,0,0,0.85)] sm:h-[480px] lg:h-[520px]">
                <EditableImage
                  src={why.image}
                  path="sections.why.image"
                  alt="Алуминиева дограма"
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/55 via-transparent to-transparent" />
              </div>
              <div className="glass-panel absolute -bottom-5 left-4 z-10 rounded-2xl border border-gold/35 px-6 py-4 sm:-bottom-6 sm:-left-4 sm:px-8 sm:py-6">
                <div className="font-display tabular-nums text-3xl font-extrabold text-gradient-gold sm:text-4xl">
                  15+
                </div>
                <div className="mt-0.5 text-xs font-medium uppercase tracking-wider text-white/70 sm:text-sm">
                  Години опит
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </SectionWrap>

      {/* FEATURES */}
      <SectionWrap path="sections.features" visible={feat.visible} label="Предимства">
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <EditableText
              as="span"
              className="section-eyebrow"
              value={feat.eyebrow}
              path="sections.features.eyebrow"
            />
            <EditableText
              as="h2"
              className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
              value={feat.heading}
              path="sections.features.heading"
            />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
            {features.map((f, i) => {
              const Icon = iconMap[f.icon];
              return (
                <Reveal key={f.title} delay={i * 90}>
                  <div
                    onPointerMove={handleCardMove}
                    onPointerLeave={handleCardLeave}
                    className="card-hover h-full rounded-2xl p-7"
                  >
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl tint-gold">
                      <Icon className="h-6 w-6 text-gold" />
                    </div>
                    <h3 className="relative z-10 mt-5 font-display text-lg font-bold text-white">
                      {f.title}
                    </h3>
                    <p className="relative z-10 mt-2.5 text-sm leading-relaxed text-white/60">
                      {f.text}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      </SectionWrap>

      {/* PROCESS */}
      <SectionWrap path="sections.process" visible={proc.visible} label="Процес">
        <section className="relative border-y border-white/10 bg-[#0d0d10]">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <Reveal className="mx-auto max-w-2xl text-center">
              <EditableText
                as="span"
                className="section-eyebrow"
                value={proc.eyebrow}
                path="sections.process.eyebrow"
              />
              <EditableText
                as="h2"
                className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                value={proc.heading}
                path="sections.process.heading"
              />
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:mt-16 lg:grid-cols-5">
              {process.map((p, i) => (
                <Reveal key={p.step} delay={i * 80}>
                  <div
                    onPointerMove={handleCardMove}
                    onPointerLeave={handleCardLeave}
                    className="card-hover group relative h-full rounded-2xl p-6"
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="font-display tabular-nums text-3xl font-extrabold text-gold/35 transition-colors group-hover:text-gold">
                        {p.step}
                      </span>
                      <span className="h-px flex-1 ml-3 bg-gradient-to-r from-gold/30 to-transparent" />
                    </div>
                    <h3 className="relative z-10 mt-4 font-display text-base font-bold text-white">
                      {p.title}
                    </h3>
                    <p className="relative z-10 mt-2 text-sm leading-relaxed text-white/60">
                      {p.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </SectionWrap>

      {/* TESTIMONIALS */}
      <SectionWrap path="sections.testimonials" visible={tst.visible} label="Отзиви">
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <EditableText
              as="span"
              className="section-eyebrow"
              value={tst.eyebrow}
              path="sections.testimonials.eyebrow"
            />
            <EditableText
              as="h2"
              className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
              value={tst.heading}
              path="sections.testimonials.heading"
            />
          </Reveal>
          <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div
                  onPointerMove={handleCardMove}
                  onPointerLeave={handleCardLeave}
                  className="card-hover flex h-full flex-col justify-between rounded-2xl p-7"
                >
                  <div className="relative z-10">
                    <div className="flex gap-1">
                      {Array.from({ length: t.rating }).map((_, k) => (
                        <Star key={k} className="h-4 w-4 fill-gold text-gold" />
                      ))}
                    </div>
                    <p className="mt-5 text-base leading-relaxed text-white/85">„{t.text}“</p>
                  </div>
                  <div className="relative z-10 mt-6 border-t border-white/10 pt-5">
                    <div className="font-display font-bold text-white">{t.name}</div>
                    <div className="mt-0.5 text-sm text-gold/80">{t.role}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </SectionWrap>

      {/* BRANDS */}
      <SectionWrap path="sections.brands" visible={brd.visible} label="Марки">
        <section className="border-y border-white/10 bg-[#0d0d10]">
          <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
              Работим с водещи европейски профилни системи
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
              {brands.map((b) => (
                <div
                  key={b}
                  className="glass-pill flex items-center justify-center rounded-xl py-4 px-5 transition-colors hover:border-gold/40"
                >
                  <span className="font-display text-xl font-bold tracking-tight text-white/70 transition-colors hover:text-gold sm:text-2xl">
                    {b}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionWrap>

      {/* CTA */}
      <SectionWrap path="sections.cta" visible={cta.visible} label="Призив">
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <Reveal className="glass-panel arch-grid-bg relative overflow-hidden rounded-3xl border border-gold/30 px-6 py-14 text-center sm:px-10 sm:py-16 lg:px-16 lg:py-20">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

              <EditableText
                as="h2"
                className="relative z-10 mx-auto max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                value={cta.heading}
                path="sections.cta.heading"
              />
              <EditableText
                as="p"
                className="relative z-10 mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg"
                value={cta.subtitle}
                path="sections.cta.subtitle"
              />
              <div className="relative z-10 mt-9 flex flex-col justify-center gap-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Link
                  to="/contact"
                  className="btn-gold inline-flex min-h-[50px] items-center justify-center rounded-xl px-7 py-3.5 text-base"
                >
                  Заявете консултация
                </Link>
                <a
                  href={company.phoneHref}
                  className="btn-ghost glass-pill inline-flex min-h-[50px] items-center justify-center rounded-xl px-7 py-3.5 text-base tabular-nums"
                >
                  {company.phone}
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </SectionWrap>
    </main>
  );
}
