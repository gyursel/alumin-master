import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  LogOut, Inbox, Image as ImageIcon, Trash2, Upload, Phone, Mail,
  Calendar, ExternalLink, Loader2, Palette, Video,
} from "lucide-react";
import api, { API } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import VideoBackgroundSettings from "../components/admin/VideoBackgroundSettings";
import AllImagesSettings from "../components/admin/AllImagesSettings";
import { resolveSiteImage } from "../components/SiteImage";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";

const CATEGORIES = ["Фасади", "Прозорци", "Врати", "Плъзгащи", "Щори"];

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString("bg-BG", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("inquiries");
  const [inquiries, setInquiries] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  // upload form
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Фасади");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [inq, gal] = await Promise.all([
        api.get("/inquiries"),
        api.get("/gallery"),
      ]);
      setInquiries(inq.data);
      setGallery(gal.data);
    } catch (e) {
      toast.error("Грешка при зареждане на данните.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  const doUpload = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("Изберете снимка."); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title || "Проект");
      fd.append("category", category);
      await api.post("/gallery", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Снимката е качена!");
      setFile(null); setPreview(null); setTitle("");
      if (fileRef.current) fileRef.current.value = "";
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Грешка при качване.");
    } finally {
      setUploading(false);
    }
  };

  const delGallery = async (id) => {
    try {
      await api.delete(`/gallery/${id}`);
      setGallery((g) => g.filter((x) => x.id !== id));
      toast.success("Изтрито.");
    } catch {
      toast.error("Грешка при изтриване.");
    }
  };

  const delInquiry = async (id) => {
    try {
      await api.delete(`/inquiries/${id}`);
      setInquiries((i) => i.filter((x) => x.id !== id));
      toast.success("Изтрито.");
    } catch {
      toast.error("Грешка при изтриване.");
    }
  };

  const tabBtn = (id, label, Icon, count) => (
    <button
      onClick={() => setTab(id)}
      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
        tab === id ? "bg-gold text-[#0a0a0b]" : "text-white/70 hover:bg-white/5"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
      {count !== undefined && (
        <span className={`rounded-full px-2 py-0.5 text-xs ${tab === id ? "bg-black/15" : "bg-white/10"}`}>{count}</span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0e0e10]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center">
              <span className="absolute inset-0 rounded-md border border-gold/60 rotate-45" />
              <span className="h-2 w-2 rounded-sm bg-gold" />
            </span>
            <div>
              <div className="font-display text-base font-bold leading-none">Дограма<span className="text-gold">Добрич</span></div>
              <div className="mt-0.5 text-xs text-white/45">Админ панел</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-white/45">{user?.email}</div>
            </div>
            {user?.picture ? (
              <img src={user.picture} alt="" className="h-9 w-9 rounded-full border border-white/15" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full tint-gold text-sm font-bold text-gold">
                {(user?.name || "A").charAt(0)}
              </div>
            )}
            <a href="/?edit=1" className="btn-gold hidden items-center gap-2 rounded-md px-4 py-2 text-sm sm:flex">
              <Palette className="h-4 w-4" /> Редактирай сайта
            </a>
            <button onClick={handleLogout} className="btn-ghost flex items-center gap-2 rounded-md px-4 py-2 text-sm">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Изход</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {tabBtn("inquiries", "Запитвания", Inbox, inquiries.length)}
            {tabBtn("gallery", "Галерия", ImageIcon, gallery.length)}
            {tabBtn("video", "Видео фон", Video)}
            {tabBtn("images", "Всички снимки", ImageIcon)}
          </div>
          <a href="/?edit=1" className="btn-gold flex items-center gap-2 rounded-md px-4 py-2 text-sm sm:hidden">
            <Palette className="h-4 w-4" /> Редактирай сайта
          </a>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : tab === "inquiries" ? (
          <div className="mt-8">
            {inquiries.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#121214] py-20 text-center text-white/50">
                <Inbox className="mx-auto h-10 w-10 text-white/20" />
                <p className="mt-4">Още няма запитвания.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((q) => (
                  <div key={q.id} className="rounded-2xl border border-white/10 bg-[#121214] p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-display text-lg font-semibold">{q.name}</h3>
                          {q.service && <span className="rounded-full tint-gold px-3 py-0.5 text-xs text-gold">{q.service}</span>}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/65">
                          <a href={`tel:${q.phone}`} className="flex items-center gap-1.5 hover:text-gold"><Phone className="h-3.5 w-3.5" /> {q.phone}</a>
                          {q.email && <a href={`mailto:${q.email}`} className="flex items-center gap-1.5 hover:text-gold"><Mail className="h-3.5 w-3.5" /> {q.email}</a>}
                          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {fmtDate(q.created_at)}</span>
                        </div>
                        {q.message && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75">{q.message}</p>}
                      </div>
                      <button onClick={() => delInquiry(q.id)} className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-white/50 transition-colors hover:border-red-500/50 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : tab === "images" ? (
          <AllImagesSettings />
        ) : tab === "video" ? (
          <div className="mt-8">
            <VideoBackgroundSettings />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* Upload */}
            <form onSubmit={doUpload} className="h-fit rounded-2xl border border-white/10 bg-[#121214] p-6">
              <h3 className="font-display text-lg font-semibold">Качете снимка</h3>
              <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-[#0a0a0b] p-6 text-center transition-colors hover:border-gold/50">
                {preview ? (
                  <img src={preview} alt="preview" className="h-40 w-full rounded-lg object-cover" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-white/30" />
                    <span className="mt-3 text-sm text-white/55">Кликнете, за да изберете файл</span>
                    <span className="mt-1 text-xs text-white/35">JPG, PNG, WebP • макс. 6MB</span>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
              </label>
              <div className="mt-4">
                <Label className="text-white/70">Заглавие</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Напр. Жилищна сграда" className="mt-2 border-white/15 bg-[#0a0a0b] text-white placeholder:text-white/30 focus-visible:ring-gold" />
              </div>
              <div className="mt-4">
                <Label className="text-white/70">Категория</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2 border-white/15 bg-[#0a0a0b] text-white focus:ring-gold"><SelectValue /></SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#17171a] text-white">
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="focus:bg-white/10 focus:text-gold">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <button type="submit" disabled={uploading} className="btn-gold mt-5 flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 disabled:opacity-60">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Качване..." : "Качете"}
              </button>
            </form>

            {/* Grid */}
            <div className="lg:col-span-2">
              {gallery.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#121214] py-20 text-center text-white/50">
                  <ImageIcon className="mx-auto h-10 w-10 text-white/20" />
                  <p className="mt-4">Още няма качени снимки.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {gallery.map((g) => (
                    <div key={g.id} className="group relative overflow-hidden rounded-2xl border border-white/10">
                      <img src={resolveSiteImage(g.url)} alt={g.title} className="h-48 w-full object-cover" />
                      <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-[#0a0a0b]/90 via-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex justify-end">
                          <button onClick={() => delGallery(g.id)} className="flex h-9 w-9 items-center justify-center rounded-md bg-black/50 text-white transition-colors hover:bg-red-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-widest text-gold">{g.category}</div>
                          <div className="font-display font-semibold">{g.title}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
