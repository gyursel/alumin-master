import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, ArrowUpRight, User } from "lucide-react";
import { company, products, navLinks, brands } from "../mock";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#070709] pb-[env(safe-area-inset-bottom)]">
      {/* Subtle architectural top reflection */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[520px] -translate-x-1/2 rounded-full bg-gold/[0.04] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                <span className="absolute inset-0 rounded-lg border border-white/15 bg-white/[0.03]" />
                <span className="absolute inset-1.5 rounded-[5px] border border-gold/65 rotate-45" />
                <span className="relative h-2 w-2 rounded-[2px] bg-gold" />
              </span>
              <span className="font-display text-lg font-bold tracking-tight">
                Дограма<span className="text-gradient-gold">Добрич</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              Производство и монтаж на алуминиева дограма с европейско качество и 3-годишна гаранция.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {brands.map((b) => (
                <span
                  key={b}
                  className="glass-pill rounded-full px-3.5 py-1 text-xs font-medium text-white/65"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">
              Навигация
            </h4>
            <ul className="mt-5 space-y-3">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">
              Продукти
            </h4>
            <ul className="mt-5 space-y-3">
              {products.map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`/products/${p.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-gold"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">
              Контакти
            </h4>
            <ul className="mt-5 space-y-3.5 text-sm text-white/65">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg tint-gold">
                  <MapPin className="h-3.5 w-3.5 text-gold" />
                </span>
                <span className="leading-snug">{company.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg tint-gold">
                  <User className="h-3.5 w-3.5 text-gold" />
                </span>
                <span>
                  {company.managerRole}: {company.manager}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg tint-gold">
                  <Phone className="h-3.5 w-3.5 text-gold" />
                </span>
                <a href={company.phoneHref} className="tabular-nums transition-colors hover:text-gold">
                  {company.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg tint-gold">
                  <Mail className="h-3.5 w-3.5 text-gold" />
                </span>
                <a href={`mailto:${company.email}`} className="break-all transition-colors hover:text-gold">
                  {company.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg tint-gold">
                  <Clock className="h-3.5 w-3.5 text-gold" />
                </span>
                <span className="leading-snug">{company.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} Дограма Добрич. Всички права запазени.
          </p>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-xs font-medium text-white/65 transition-all hover:border-gold/40 hover:text-gold"
          >
            Заявете безплатна консултация
            <ArrowUpRight className="h-3.5 w-3.5 text-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
