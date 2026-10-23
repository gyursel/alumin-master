import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Palette, UploadCloud, Undo2, X, Loader2 } from "lucide-react";
import { useContent } from "../../context/ContentContext";

export default function EditToolbar() {
  const { content, editMode, update, publish, discard, saving, dirty } = useContent();
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);

  if (!editMode || !content) return null;

  const accent = content?.global?.accent || "#c9a15a";

  const doPublish = async () => {
    setPublishing(true);
    try {
      await publish();
      toast.success("Публикувано! Промените са видими за всички.");
    } catch {
      toast.error("Грешка при публикуване.");
    } finally {
      setPublishing(false);
    }
  };

  const doDiscard = async () => {
    try {
      await discard();
      toast.success("Промените са отменени.");
    } catch {
      toast.error("Грешка.");
    }
  };

  const exit = () => navigate("/admin");

  return (
    <div className="fixed inset-x-0 top-0 z-[200]">
      <div className="glass-nav flex flex-wrap items-center justify-between gap-3 border-b border-gold/30 px-4 py-2.5 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-gold">
            <Palette className="h-4 w-4" /> Режим на редакция
          </span>
          <span className="text-xs text-white/50">
            {saving ? (
              <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Запазване...</span>
            ) : dirty ? (
              "Незапазена чернова"
            ) : (
              "Черновата е запазена"
            )}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="glass-pill flex min-h-[36px] cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-white/80 transition-colors hover:border-gold">
            <span className="h-4 w-4 rounded-full border border-white/30" style={{ backgroundColor: accent }} />
            Акцент
            <input
              type="color"
              value={accent}
              onChange={(e) => update("global.accent", e.target.value)}
              className="h-0 w-0 opacity-0"
            />
          </label>

          <button
            onClick={doDiscard}
            className="glass-pill flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white/80 transition-colors hover:border-white/40"
          >
            <Undo2 className="h-3.5 w-3.5" /> Отмени
          </button>

          <button
            onClick={doPublish}
            disabled={publishing}
            className="btn-gold flex min-h-[36px] items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs disabled:opacity-60"
          >
            {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
            Публикувай
          </button>

          <button
            onClick={exit}
            className="glass-pill flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white/80 transition-colors hover:border-white/40"
          >
            <X className="h-3.5 w-3.5" /> Изход
          </button>
        </div>
      </div>
    </div>
  );
}
