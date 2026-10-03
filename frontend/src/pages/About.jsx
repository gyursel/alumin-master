import { Link } from "react-router-dom";
import { Gem, Clock, MessagesSquare, LifeBuoy, ArrowRight } from "lucide-react";
import Reveal from "../components/Reveal";
import SiteImage from "../components/SiteImage";
import { aboutImages, values, stats, brands } from "../mock";

const iconMap = { Gem, Clock, MessagesSquare, LifeBuoy };

export default function About() {
  return (
    <main className="overflow-hidden pt-24">
      <section className="border-b border-white/10 bg-[#0e0e10]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <Reveal className="max-w-3xl">
            <span className="section-eyebrow">За нас</span>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Дограма Добрич — кои сме ние
            </h1>
          </Reveal>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              15 години опит в бранша
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-white/65">
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
          </Reveal>
          <Reveal delay={150}>
            <div className="grid grid-cols-2 gap-4">
              <SiteImage slot="about_main" fallback={aboutImages.main} alt="За нас" className="col-span-2 h-64 w-full rounded-2xl border border-white/10 object-cover" />
              <SiteImage slot="about_workshop" fallback={aboutImages.workshop} alt="Производство" className="h-44 w-full rounded-2xl border border-white/10 object-cover" />
              <SiteImage slot="about_fabrication" fallback={aboutImages.fabrication} alt="Обработка" className="h-44 w-full rounded-2xl border border-white/10 object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-white/10 bg-[#0e0e10]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-5 py-14 lg:grid-cols-4 lg:px-8">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="text-center">
              <div className="font-display text-4xl font-extrabold text-gradient-gold sm:text-5xl">{s.value}</div>
              <div className="mt-2 text-sm uppercase tracking-wider text-white/55">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">Нашите ценности</span>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Какво ни отличава
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => {
            const Icon = iconMap[v.icon];
            return (
              <Reveal key={v.title} delay={i * 90}>
                <div className="card-hover h-full rounded-2xl border border-white/10 bg-[#121214] p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl tint-gold">
                    <Icon className="h-6 w-6 text-gold" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{v.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 bg-[#0e0e10]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-16 text-center lg:flex-row lg:px-8 lg:text-left">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Започнете своя проект с нас</h2>
            <p className="mt-2 text-white/60">Безплатна консултация и оферта без ангажимент.</p>
          </div>
          <Link to="/contact" className="btn-gold inline-flex items-center gap-2 rounded-md px-7 py-3.5">
            Свържете се с нас
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
