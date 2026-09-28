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
      "Прозорци, врати и фасадни системи с европейско качество. Собствено производство, монтаж и 10-годишна гаранция.",
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

export default function Home() {
  const { content, loaded } = useContent();
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

  return (
    <main className="overflow-hidden">
      {/* HERO */}
      <section className="relative flex min-h-screen items-center">
        <div className="absolute inset-0">
          <HeroBackdrop loaded={loaded} src={hero.image} fallbackSrc={DEFAULTS.hero.image} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a0a0b] via-[#0a0a0b]/85 to-[#0a0a0b]/40" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-[#0a0a0b]/60" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-28 lg:px-8">
          <div className="max-w-2xl">
            <Reveal>
              <EditableText as="span" className="section-eyebrow" value={hero.eyebrow} path="sections.hero.eyebrow" />
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                <EditableText as="span" className="block" value={hero.titleLine1} path="sections.hero.titleLine1" />
                <span className="block">
                  <EditableText as="span" value={hero.titleLead} path="sections.hero.titleLead" />
                  <EditableText as="span" className="text-gradient-gold" value={hero.titleAccent} path="sections.hero.titleAccent" />
                </span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <EditableText
                as="p"
                className="mt-6 max-w-xl text-lg leading-relaxed text-white/70"
                value={hero.subtitle}
                path="sections.hero.subtitle"
              />
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link to="/contact" className="btn-gold group flex items-center gap-2 rounded-md px-7 py-3.5 text-base">
                  Безплатна консултация
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/products" className="btn-ghost rounded-md px-7 py-3.5 text-base">
                  Вижте продуктите
                </Link>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/40">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </section>

      {/* STATS */}
      <SectionWrap path="sections.stats" visible={stats.visible} label="Статистики">
        <section className="border-y border-white/10 bg-[#0e0e10]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-5 py-14 lg:grid-cols-4 lg:px-8">
            {(stats.items || mockStats).map((s, i) => (
              <Reveal key={i} delay={i * 80} className="text-center">
                <EditableText
                  as="div"
                  className="font-display text-4xl font-extrabold text-gradient-gold sm:text-5xl"
                  value={s.value}
                  path={`sections.stats.items.${i}.value`}
                />
                <EditableText
                  as="div"
                  className="mt-2 text-sm uppercase tracking-wider text-white/55"
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
        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <Reveal className="max-w-2xl">
            <EditableText as="span" className="section-eyebrow" value={prod.eyebrow} path="sections.products.eyebrow" />
            <EditableText
              as="h2"
              className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl"
              value={prod.heading}
              path="sections.products.heading"
            />
            <EditableText as="p" className="mt-4 text-lg text-white/60" value={prod.subtitle} path="sections.products.subtitle" />
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((p, i) => (
              <Reveal key={p.slug} delay={i * 90}>
                <Link
                  to={`/products/${p.slug}`}
                  className="card-hover group block overflow-hidden rounded-2xl border border-white/10 bg-[#121214]"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-transparent to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{p.short}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold">
                      Научете повече
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 text-center">
            <Link to="/products" className="btn-ghost inline-flex items-center gap-2 rounded-md px-7 py-3.5">
              Всички продукти
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </section>
      </SectionWrap>

      {/* WHY US */}
      <SectionWrap path="sections.why" visible={why.visible} label="Защо ние">
        <section className="relative border-y border-white/10 bg-[#0e0e10]">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 lg:grid-cols-2 lg:px-8">
            <Reveal>
              <EditableText as="span" className="section-eyebrow" value={why.eyebrow} path="sections.why.eyebrow" />
              <EditableText
                as="h2"
                className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl"
                value={why.heading}
                path="sections.why.heading"
              />
              <EditableText as="p" className="mt-4 text-lg leading-relaxed text-white/60" value={why.text} path="sections.why.text" />
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {advantages.map((a) => (
                  <li key={a} className="flex items-start gap-3 text-sm text-white/75">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full tint-gold">
                      <Check className="h-3 w-3 text-gold" />
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
              <Link to="/about" className="btn-gold mt-9 inline-flex items-center gap-2 rounded-md px-7 py-3.5">
                За нас
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>

            <Reveal delay={150} className="relative">
              <div className="relative h-[520px] overflow-hidden rounded-2xl border border-white/10">
                <EditableImage src={why.image} path="sections.why.image" alt="Алуминиева дограма" className="h-[520px] w-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-2xl border border-gold/30 bg-[#121214] px-8 py-6 shadow-2xl">
                <div className="font-display text-4xl font-extrabold text-gradient-gold">15+</div>
                <div className="text-sm text-white/60">Години опит</div>
              </div>
            </Reveal>
          </div>
        </section>
      </SectionWrap>

      {/* FEATURES */}
      <SectionWrap path="sections.features" visible={feat.visible} label="Предимства">
        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <EditableText as="span" className="section-eyebrow" value={feat.eyebrow} path="sections.features.eyebrow" />
            <EditableText
              as="h2"
              className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl"
              value={feat.heading}
              path="sections.features.heading"
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => {
              const Icon = iconMap[f.icon];
              return (
                <Reveal key={f.title} delay={i * 90}>
                  <div className="card-hover h-full rounded-2xl border border-white/10 bg-[#121214] p-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl tint-gold">
                      <Icon className="h-6 w-6 text-gold" />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{f.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      </SectionWrap>

      {/* PROCESS */}
      <SectionWrap path="sections.process" visible={proc.visible} label="Процес">
        <section className="border-y border-white/10 bg-[#0e0e10]">
          <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <EditableText as="span" className="section-eyebrow" value={proc.eyebrow} path="sections.process.eyebrow" />
              <EditableText
                as="h2"
                className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl"
                value={proc.heading}
                path="sections.process.heading"
              />
            </Reveal>
            <div className="mt-14 grid gap-6 md:grid-cols-3 lg:grid-cols-5">
              {process.map((p, i) => (
                <Reveal key={p.step} delay={i * 80}>
                  <div className="group relative h-full rounded-2xl border border-white/10 bg-[#121214] p-6 transition-colors hover:border-gold/40">
                    <div className="font-display text-3xl font-extrabold text-white/12 transition-colors group-hover:text-gold/40">
                      {p.step}
                    </div>
                    <h3 className="mt-3 font-display text-base font-semibold">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{p.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </SectionWrap>

      {/* TESTIMONIALS */}
      <SectionWrap path="sections.testimonials" visible={tst.visible} label="Отзиви">
        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <EditableText as="span" className="section-eyebrow" value={tst.eyebrow} path="sections.testimonials.eyebrow" />
            <EditableText
              as="h2"
              className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl"
              value={tst.heading}
              path="sections.testimonials.heading"
            />
          </Reveal>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="card-hover h-full rounded-2xl border border-white/10 bg-[#121214] p-7">
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, k) => (
                      <Star key={k} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="mt-5 leading-relaxed text-white/80">„{t.text}“</p>
                  <div className="mt-6 border-t border-white/10 pt-5">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-white/50">{t.role}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </SectionWrap>

      {/* BRANDS */}
      <SectionWrap path="sections.brands" visible={brd.visible} label="Марки">
        <section className="border-y border-white/10 bg-[#0e0e10]">
          <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
            <p className="text-center text-xs uppercase tracking-widest text-white/40">
              Работим с водещи европейски профилни системи
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
              {brands.map((b) => (
                <span key={b} className="font-display text-2xl font-bold text-white/35 transition-colors hover:text-gold">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </section>
      </SectionWrap>

      {/* CTA */}
      <SectionWrap path="sections.cta" visible={cta.visible} label="Призив">
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
            <Reveal className="relative overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-[#161410] to-[#0e0e10] px-8 py-16 text-center lg:px-16">
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full tint-gold blur-3xl" />
              <EditableText
                as="h2"
                className="relative font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                value={cta.heading}
                path="sections.cta.heading"
              />
              <EditableText
                as="p"
                className="relative mx-auto mt-5 max-w-2xl text-lg text-white/65"
                value={cta.subtitle}
                path="sections.cta.subtitle"
              />
              <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link to="/contact" className="btn-gold rounded-md px-7 py-3.5 text-base">
                  Заявете консултация
                </Link>
                <a href={company.phoneHref} className="btn-ghost rounded-md px-7 py-3.5 text-base">
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
