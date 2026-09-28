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
    <main className="overflow-hidden pt-24">
      <section className="border-b border-white/10 bg-[#0e0e10]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <Reveal className="max-w-3xl">
            <span className="section-eyebrow">Контакти</span>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Свържете се с нас
            </h1>
            <p className="mt-5 text-lg text-white/60">
              Изпратете запитване и нашите специалисти ще се свържат
              с вас в рамките на деня.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          {/* Info */}
          <Reveal className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold">Информация за контакт</h2>
            <div className="mt-8 space-y-6">
              {contactInfo.map((c) => (
                <div key={c.label} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl tint-gold">
                    <c.icon className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <div className="text-sm uppercase tracking-wider text-white/45">{c.label}</div>
                    {c.href ? (
                      <a href={c.href} className="mt-0.5 block text-white/85 transition-colors hover:text-gold">
                        {c.value}
                      </a>
                    ) : (
                      <div className="mt-0.5 text-white/85">{c.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-gold/25 bg-gradient-to-br from-[#161410] to-[#0e0e10] p-7">
              <h3 className="font-display text-lg font-semibold">Безплатна консултация</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Нашите специалисти ще посетят обекта ви, ще направят
                измерване и ще изготвят детайлна оферта без ангажимент.
              </p>
              <a
                href={company.phoneHref}
                className="btn-gold mt-5 inline-flex items-center gap-2 rounded-md px-6 py-3"
              >
                Обадете се сега
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={120} className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/10 bg-[#121214] p-8"
            >
              <h2 className="font-display text-2xl font-bold">Изпратете запитване</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <Label className="text-white/70">Имена *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Вашето име"
                    className="mt-2 border-white/15 bg-[#0a0a0b] text-white placeholder:text-white/30 focus-visible:ring-gold"
                  />
                </div>
                <div>
                  <Label className="text-white/70">Телефон *</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0899 ..."
                    className="mt-2 border-white/15 bg-[#0a0a0b] text-white placeholder:text-white/30 focus-visible:ring-gold"
                  />
                </div>
                <div>
                  <Label className="text-white/70">Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com"
                    className="mt-2 border-white/15 bg-[#0a0a0b] text-white placeholder:text-white/30 focus-visible:ring-gold"
                  />
                </div>
                <div>
                  <Label className="text-white/70">Интерес към</Label>
                  <Select
                    value={form.service}
                    onValueChange={(v) => setForm({ ...form, service: v })}
                  >
                    <SelectTrigger className="mt-2 border-white/15 bg-[#0a0a0b] text-white focus:ring-gold">
                      <SelectValue placeholder="Изберете услуга" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#17171a] text-white">
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
                <Label className="text-white/70">Съобщение</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Опишете вашите нужди..."
                  rows={5}
                  className="mt-2 border-white/15 bg-[#0a0a0b] text-white placeholder:text-white/30 focus-visible:ring-gold"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-gold mt-7 flex w-full items-center justify-center gap-2 rounded-md px-6 py-3.5 text-base disabled:opacity-60 sm:w-auto"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Изпращане..." : "Изпратете запитване"}
              </button>
              <p className="mt-4 text-xs text-white/40">Задължителните полета са отбелязани с *</p>
            </form>
          </Reveal>
        </div>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <Reveal className="overflow-hidden rounded-2xl border border-white/10">
          <iframe
            title="Карта"
            className="h-[420px] w-full grayscale-[0.3]"
            loading="lazy"
            src="https://www.openstreetmap.org/export/embed.html?bbox=23.28%2C42.68%2C23.36%2C42.72&layer=mapnik&marker=42.6977%2C23.3219"
          />
        </Reveal>
      </section>
    </main>
  );
}
