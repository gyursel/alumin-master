import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Trash2, RefreshCw, Loader2, Video as VideoIcon } from "lucide-react";
import api from "../../lib/api";
import { resolveMediaUrl, invalidateVideoBackground } from "../../lib/videoBackground";
import { Switch } from "../ui/switch";

const MAX_BYTES = 10 * 1024 * 1024; // същият лимит като в backend-а
const ALLOWED = ["video/mp4", "video/webm"];

export default function VideoBackgroundSettings() {
  const [cfg, setCfg] = useState({ enabled: false, url: null });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/settings/video-background");
      setCfg({ enabled: Boolean(res.data?.enabled), url: res.data?.url || null });
    } catch {
      toast.error("Грешка при зареждане на настройката.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      toast.error("Разрешени са само видео файлове MP4 или WebM.");
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("Видеото е твърде голямо (макс. 10MB).");
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const up = await api.post("/media/video", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (ev) => {
          if (ev.total) setProgress(Math.round((ev.loaded / ev.total) * 100));
        },
      });
      // Първо видео -> включва се автоматично; при смяна остава текущото състояние.
      const enabled = cfg.url ? cfg.enabled : true;
      const res = await api.put("/settings/video-background", { url: up.data.url, enabled });
      invalidateVideoBackground();
      setCfg({ enabled: Boolean(res.data.enabled), url: res.data.url || null });
      toast.success(cfg.url ? "Видеото е сменено." : "Видеото е качено.");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Грешка при качване.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const toggle = async (checked) => {
    setBusy(true);
    try {
      const res = await api.put("/settings/video-background", { enabled: checked });
      invalidateVideoBackground();
      setCfg({ enabled: Boolean(res.data.enabled), url: res.data.url || null });
      toast.success(checked ? "Видео фонът е включен." : "Видео фонът е изключен.");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Грешка при запазване.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Да премахна ли текущото видео?")) return;
    setBusy(true);
    try {
      await api.delete("/settings/video-background");
      invalidateVideoBackground();
      setCfg({ enabled: false, url: null });
      toast.success("Видеото е премахнато.");
    } catch {
      toast.error("Грешка при премахване.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  const videoSrc = resolveMediaUrl(cfg.url);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="h-fit rounded-2xl border border-white/10 bg-[#121214] p-6">
        <h3 className="font-display text-lg font-semibold">Видео фон</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Видеото се показва като фон на началната секция. Ако е изключено, липсва или не може да се
          зареди, сайтът ползва обичайната снимка.
        </p>

        <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-[#0a0a0b] px-4 py-3">
          <div>
            <div className="text-sm font-medium">{cfg.enabled ? "Включен" : "Изключен"}</div>
            <div className="text-xs text-white/40">
              {cfg.url ? "Показва се на началната страница" : "Първо качете видео"}
            </div>
          </div>
          <Switch
            checked={cfg.enabled}
            disabled={!cfg.url || busy || uploading}
            onCheckedChange={toggle}
            className="data-[state=checked]:bg-gold data-[state=unchecked]:bg-white/20"
          />
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm,.mp4,.webm"
          onChange={onFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || busy}
          className="btn-gold mt-5 flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : cfg.url ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? `Качване... ${progress}%` : cfg.url ? "Смени видеото" : "Качете видео"}
        </button>

        {cfg.url && (
          <button
            type="button"
            onClick={remove}
            disabled={uploading || busy}
            className="btn-ghost mt-3 flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-sm disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" /> Премахни видеото
          </button>
        )}

        <p className="mt-4 text-xs leading-relaxed text-white/35">
          MP4 (H.264) или WebM • макс. 10MB • препоръчително 1080p, 10–20 сек., без звук.
        </p>
      </div>

      <div className="lg:col-span-2">
        {videoSrc ? (
          <video
            key={videoSrc}
            src={videoSrc}
            controls
            muted
            loop
            playsInline
            preload="metadata"
            className="aspect-video w-full rounded-2xl border border-white/10 bg-black object-contain"
          />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#121214] py-20 text-center text-white/50">
            <VideoIcon className="mx-auto h-10 w-10 text-white/20" />
            <p className="mt-4">Още няма качено видео.</p>
          </div>
        )}
      </div>
    </div>
  );
}
