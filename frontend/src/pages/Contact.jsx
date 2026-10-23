import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, ArrowRight, User } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import Reveal from "../components/Reveal";
import { company, serviceOptions } from "../mock";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const contactInfo = [
  { icon: MapPin, label: "Адрес", value: company.address },
  { icon: User, label: company.managerRole, value: company.manager },
  { icon: Phone, label: "Телефон", value: company.phone, href: company.phoneHref },
  { icon: Mail, label: "Email", value: company.email, href: `mailto:${company.email}` },
  { icon: Clock, label: "Работно време", value: company.hours },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Моля, попълнете име и телефон.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/inquiries`, form);
      toast.success("Благодарим! Ще се свържем с вас в рамките на деня.");
      setForm({ name: "", phone: "", email: "", service: "", message: "" });
    } catch (err) {
      toast.error("Възникна грешка. Моля, опитайте отново или ни се обадете.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="overflow-hidden pt-20">
      {/* Header */}
      <section className="arch-grid-bg relative overflow-hidden border-b border-white/10 bg-[#0e0e11]">
        <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-gold/10 blur-[120px]" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-24 lg:px-8">
          <Reveal className="max-w-3xl">
            <span className="section-eyebrow">Контакти</span>
            <h1 className="mt-5 font-display text-fluid-h1 font-extrabold tracking-tight text-white">
              Свържете се с нас
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
              Изпратете запитване и нашите специалисти ще се свържат
              с вас в рамките на деня.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Info */}
          <Reveal className="lg:col-span-5">
            <h2 className="font-display text-2xl font-bold text-white">Информация за контакт</h2>
            <div className="mt-7 space-y-4">
              {contactInfo.map((c) => (
                <div
                  key={c.label}
                  className="glass-panel flex items-start gap-4 rounded-2xl p-4 transition-colors hover:border-gold/35"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/30 tint-gold shadow-[0_0_20px_rgba(201,161,90,0.12)]">
                    <c.icon className="h-5 w-5 text-gold" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                      {c.label}
                    </div>
                    {c.href ? (
                      <a
                        href={c.href}
                        className="mt-1 block break-words text-base font-medium text-white/90 transition-colors hover:text-gold"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <div className="mt-1 break-words text-base font-medium text-white/90">
                        {c.value}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-panel-gold mt-8 rounded-3xl p-7 sm:p-8">
              <h3 className="font-display text-lg font-bold text-white">Безплатна консултация</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-white/65">
                Нашите специалисти ще посетят обекта ви, ще направят
                измерване и ще изготвят детайлна оферта без ангажимент.
              </p>
              <a
                href={company.phoneHref}
                className="btn-gold mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm sm:w-auto"
              >
                Обадете се сега
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={120} className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="glass-panel rounded-3xl p-6 sm:p-10"
            >
              <h2 className="font-display text-2xl font-bold text-white">Изпратете запитване</h2>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-white/75">Имена *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Вашето име"
                    className="arch-input mt-2 h-12 rounded-xl text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-white/75">Телефон *</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0899 ..."
                    className="arch-input mt-2 h-12 rounded-xl text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-white/75">Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com"
                    className="arch-input mt-2 h-12 rounded-xl text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-white/75">Интерес към</Label>
                  <Select
                    value={form.service}
                    onValueChange={(v) => setForm({ ...form, service: v })}
                  >
                    <SelectTrigger className="arch-input mt-2 h-12 rounded-xl text-white">
                      <SelectValue placeholder="Изберете услуга" />
                    </SelectTrigger>
                    <SelectContent className="border-white/15 bg-[#16161a] text-white">
                      {serviceOptions.map((s) => (
                        <SelectItem key={s} value={s} className="focus:bg-white/10 focus:text-gold">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-5">
                <Label className="text-sm font-medium text-white/75">Съобщение</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Опишете вашите нужди..."
                  rows={5}
                  className="arch-input mt-2 rounded-xl text-white placeholder:text-white/30"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-gold mt-7 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm disabled:opacity-60 sm:w-auto"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Изпращане..." : "Изпратете запитване"}
              </button>
              <p className="mt-4 text-xs text-white/45">Задължителните полета са отбелязани с *</p>
            </form>
          </Reveal>
        </div>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:pb-28 lg:px-8">
        <Reveal className="arch-frame-corners glass-panel overflow-hidden rounded-3xl p-2 sm:p-3">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <iframe
              title="Карта"
              className="h-[340px] w-full grayscale-[0.3] sm:h-[420px]"
              loading="lazy"
              src={`https://maps.google.com/maps?q=${encodeURIComponent("ул. Отец Паисий 13, Добрич 9300, България")}&z=17&hl=bg&output=embed`}
            />
          </div>
        </Reveal>
      </section>
    </main>
  );
}
