import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Phone, ArrowUpRight } from "lucide-react";
import { navLinks, products, company } from "../mock";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "./ui/sheet";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 group focus:outline-none">
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
        <span className="absolute inset-0 rounded-lg border border-white/15 bg-white/[0.03] transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute inset-1.5 rounded-[5px] border border-gold/65 rotate-45 transition-transform duration-500 group-hover:rotate-[135deg]" />
        <span className="relative h-2 w-2 rounded-[2px] bg-gold shadow-[0_0_12px_rgba(201,161,90,0.8)]" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight leading-none text-white sm:text-[19px]">
        Дограма<span className="text-gradient-gold">Добрич</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [prodOpen, setProdOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setProdOpen(false);
  }, [location.pathname]);

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-nav py-2.5"
          : "bg-gradient-to-b from-[#0a0a0b]/90 via-[#0a0a0b]/55 to-transparent py-4"
      }`}
    >
      <nav
        aria-label="Основна навигация"
        className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-5 lg:px-8"
      >
        <Logo />

        {/* Desktop navigation pill */}
        <div className="hidden lg:flex items-center gap-1 rounded-full border border-white/10 bg-[#121216]/75 px-2 py-1.5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          {navLinks.map((link) =>
            link.to === "/products" ? (
              <div
                key={link.to}
                className="relative"
                onMouseEnter={() => setProdOpen(true)}
                onMouseLeave={() => setProdOpen(false)}
              >
                <Link
                  to={link.to}
                  onFocus={() => setProdOpen(true)}
                  className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? "bg-white/[0.08] text-gold shadow-[inset_0_1px_0_rgba(226,192,129,0.25)]"
                      : "text-white/80 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {link.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${
                      prodOpen ? "rotate-180 text-gold" : ""
                    }`}
                  />
                </Link>
                <div
                  className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-all duration-300 ${
                    prodOpen
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="glass-panel w-72 rounded-2xl p-2.5">
                    <div className="mb-1.5 px-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/80">
                      Алуминиеви системи
                    </div>
                    {products.map((p, idx) => (
                      <Link
                        key={p.slug}
                        to={`/products/${p.slug}`}
                        className="group/item flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white/80 transition-all hover:bg-white/[0.06] hover:text-gold"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="font-display text-[11px] font-semibold text-white/30 transition-colors group-hover/item:text-gold/70">
                            0{idx + 1}
                          </span>
                          <span>{p.title}</span>
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 group-hover/item:opacity-100 text-gold" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? "bg-white/[0.08] text-gold shadow-[inset_0_1px_0_rgba(226,192,129,0.25)]"
                    : "text-white/80 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-3.5">
          <a
            href={company.phoneHref}
            className="glass-pill flex min-h-[42px] items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-white/85 transition-colors hover:border-gold/40 hover:text-gold"
          >
            <Phone className="h-4 w-4 text-gold" />
            <span className="tabular-nums">{company.phone}</span>
          </a>
          <Link
            to="/contact"
            className="btn-gold flex min-h-[42px] items-center rounded-lg px-5 py-2.5 text-sm"
          >
            Заявете оферта
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href={company.phoneHref}
            aria-label={`Обадете се на ${company.phone}`}
            className="glass-pill flex h-11 w-11 items-center justify-center rounded-lg text-gold transition-colors hover:border-gold/50"
          >
            <Phone className="h-4 w-4" />
          </a>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Отвори менюто"
                className="glass-pill flex h-11 w-11 items-center justify-center rounded-lg text-white transition-colors hover:border-gold/50 hover:text-gold"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="glass-panel flex h-full w-[min(88vw,340px)] flex-col border-l border-white/12 bg-[#0b0b0e]/95 p-0 text-white [&>button:first-child]:hidden"
            >
              <SheetTitle className="sr-only">Навигационно меню</SheetTitle>
              <SheetDescription className="sr-only">
                Връзки към страниците и продуктите на Дограма Добрич
              </SheetDescription>

              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <Logo />
                <button
                  type="button"
                  aria-label="Затвори менюто"
                  onClick={() => setOpen(false)}
                  className="glass-pill flex h-11 w-11 items-center justify-center rounded-lg text-white/75 transition-colors hover:border-gold/40 hover:text-gold"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className={`flex min-h-[46px] items-center justify-between rounded-xl px-3.5 py-2.5 text-base font-medium transition-all ${
                        isActive(link.to)
                          ? "border border-gold/30 bg-gold/10 text-gold"
                          : "text-white/85 hover:bg-white/5"
                      }`}
                    >
                      <span>{link.label}</span>
                      {isActive(link.to) && (
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                      )}
                    </Link>
                  ))}
                </div>

                <div className="my-4 gold-divider" />

                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/80">
                  Продукти
                </p>
                <div className="space-y-1">
                  {products.map((p, idx) => (
                    <Link
                      key={p.slug}
                      to={`/products/${p.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-gold"
                    >
                      <span className="font-display text-xs font-semibold text-white/30">
                        0{idx + 1}
                      </span>
                      <span>{p.title}</span>
                    </Link>
                  ))}
                </div>

                <div className="mt-auto pt-6">
                  <Link
                    to="/contact"
                    onClick={() => setOpen(false)}
                    className="btn-gold flex min-h-[48px] w-full items-center justify-center rounded-xl px-5 py-3 text-center text-sm"
                  >
                    Заявете оферта
                  </Link>
                  <a
                    href={company.phoneHref}
                    className="glass-pill mt-3 flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white/85 transition-colors hover:border-gold/40 hover:text-gold"
                  >
                    <Phone className="h-4 w-4 text-gold" />
                    <span className="tabular-nums">{company.phone}</span>
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
