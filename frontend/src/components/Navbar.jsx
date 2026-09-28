import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import { navLinks, products, company } from "../mock";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./ui/sheet";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="relative flex h-9 w-9 items-center justify-center">
        <span className="absolute inset-0 rounded-md border border-gold/60 rotate-45 transition-transform duration-500 group-hover:rotate-[135deg]" />
        <span className="h-2 w-2 rounded-sm bg-gold" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight leading-none">
        Дограма<span className="text-gold">Добрич</span>
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
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a0b]/85 backdrop-blur-xl border-b border-white/10 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo />

        <div className="hidden lg:flex items-center gap-1">
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
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${
                    isActive(link.to) ? "text-gold" : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${
                      prodOpen ? "rotate-180" : ""
                    }`}
                  />
                </Link>
                <div
                  className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-all duration-300 ${
                    prodOpen
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-2"
                  }`}
                >
                  <div className="w-64 rounded-xl border border-white/10 bg-[#121214] p-2 shadow-2xl">
                    {products.map((p) => (
                      <Link
                        key={p.slug}
                        to={`/products/${p.slug}`}
                        className="block rounded-lg px-3 py-2.5 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-gold"
                      >
                        {p.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(link.to) ? "text-gold" : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <a
            href={company.phoneHref}
            className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-gold"
          >
            <Phone className="h-4 w-4" />
            {company.phone}
          </a>
          <Link
            to="/contact"
            className="btn-gold rounded-md px-5 py-2.5 text-sm"
          >
            Заявете оферта
          </Link>
        </div>

        {/* Mobile */}
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] border-l border-white/10 bg-[#0a0a0b] p-0 text-white">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <Logo />
                <button onClick={() => setOpen(false)} className="text-white/70">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={`rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                      isActive(link.to) ? "text-gold" : "text-white/85 hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-3 h-px bg-white/10" />
                <p className="px-3 pb-2 text-xs uppercase tracking-widest text-white/40">
                  Продукти
                </p>
                {products.map((p) => (
                  <Link
                    key={p.slug}
                    to={`/products/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-gold"
                  >
                    {p.title}
                  </Link>
                ))}
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="btn-gold mt-5 rounded-md px-5 py-3 text-center text-sm"
                >
                  Заявете оферта
                </Link>
                <a
                  href={company.phoneHref}
                  className="mt-4 flex items-center justify-center gap-2 text-sm text-white/70"
                >
                  <Phone className="h-4 w-4" /> {company.phone}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
