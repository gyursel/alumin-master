import { Link } from "react-router-dom";
import { Gem, Clock, MessagesSquare, LifeBuoy, ArrowRight } from "lucide-react";
import Reveal from "../components/Reveal";
import SiteImage from "../components/SiteImage";
import { aboutImages, values, stats } from "../mock";

const iconMap = { Gem, Clock, MessagesSquare, LifeBuoy };

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

export default function About() {
  return (
    <main className="overflow-hidden pt-20">
      {/* Header */}
      <section className="arch-grid-bg relative overflow-hidden border-b border-white/10 bg-[#0e0e11]">
        <div className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-gold/10 blur-[120px]" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-24 lg:px-8">
          <Reveal className="max-w-3xl">
            <span className="section-eyebrow">За нас</span>
            <h1 className="mt-5 font-display text-fluid-h1 font-extrabold tracking-tight text-white">
              Дограма Добрич — кои сме ние
            </h1>
          </Reveal>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <div className="glass-panel rounded-3xl p-6 sm:p-10">
              <span className="section-eyebrow">История и опит</span>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
                15 години опит в бранша
              </h2>
              <div className="mt-6 space-y-5 text-base leading-relaxed text-white/70 sm:text-lg">
                <p>
                  Дограма Добрич е основана през 2009 г. с ясна мисия – да
                  предлага висококачествена алуминиева дограма на достъпни
                  цени с отличен монтаж и обслужване.
                </p>
                <p>
                  Днес сме сред водещите компании в сектора с екип от над
                  30 специалиста и собствена производствена база. Реализирали
                  сме над 2500 проекта в цялата страна.
                </p>
                <p>
                  Работим с профилни системи от Schüco, Reynaers, Aliplast и
                  Wicona – утвърдени европейски марки, синоним на
                  качество и иновации.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150} className="lg:col-span-6">
            <div className="arch-frame-corners glass-panel grid grid-cols-2 gap-4 rounded-3xl p-4 sm:p-5">
              <div className="group relative col-span-2 overflow-hidden rounded-2xl border border-white/15">
                <SiteImage
                  slot="about_main"
                  fallback={aboutImages.main}
                  alt="За нас"
                  className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-72"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/55 to-transparent" />
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-white/15">
                <SiteImage
                  slot="about_workshop"
                  fallback={aboutImages.workshop}
                  alt="Производство"
                  className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-48"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/55 to-transparent" />
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-white/15">
                <SiteImage
                  slot="about_fabrication"
                  fallback={aboutImages.fabrication}
                  alt="Обработка"
                  className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-48"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/55 to-transparent" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-white/10 bg-[#0e0e11]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 py-12 sm:gap-6 sm:py-16 lg:grid-cols-4 lg:px-8">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="glass-panel relative overflow-hidden rounded-2xl p-6 text-center sm:p-7">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                <div className="font-display text-3xl font-extrabold text-gradient-gold sm:text-5xl">
                  {s.value}
                </div>
                <div className="mt-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white/60 sm:text-sm">
                  {s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">Нашите ценности</span>
          <h2 className="mt-4 font-display text-fluid-h2 font-bold tracking-tight text-white">
            Какво ни отличава
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => {
            const Icon = iconMap[v.icon];
            return (
              <Reveal key={v.title} delay={i * 90}>
                <div
                  onMouseMove={handleTiltMove}
                  onMouseLeave={handleTiltLeave}
                  className="card-hover glass-panel h-full rounded-2xl p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/30 tint-gold shadow-[0_0_24px_rgba(201,161,90,0.14)]">
                    <Icon className="h-6 w-6 text-gold" />
                  </div>
                  <h3 className="mt-6 font-display text-lg font-bold text-white">{v.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/60">{v.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 bg-[#0e0e11]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8">
          <div className="glass-panel-gold flex flex-col items-center justify-between gap-6 rounded-3xl p-8 text-center sm:p-12 lg:flex-row lg:text-left">
            <div>
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                Започнете своя проект с нас
              </h2>
              <p className="mt-2 text-base text-white/65">
                Безплатна консултация и оферта без ангажимент.
              </p>
            </div>
            <Link
              to="/contact"
              className="btn-gold inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm sm:w-auto"
            >
              Свържете се с нас
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
