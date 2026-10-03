import React, { useRef, useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api, { API } from "../../lib/api";
import { useContent } from "../../context/ContentContext";

function resolve(src) {
  if (!src) return src;
  return src.startsWith("/api/") ? `${API.replace(/\/api\/?$/, "")}${src}` : src;
}

// Editable image. In edit mode shows an overlay button to upload a replacement.
export default function EditableImage({ src, path, alt = "", className = "" }) {
  const { editMode, update } = useContent();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await api.post("/media", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      update(path, res.data.url);
      toast.success("Снимката е сменена.");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Грешка при качване.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  if (!editMode) {
    return <img src={resolve(src)} alt={alt} className={className} />;
  }

  return (
    <div className="group/edimg relative h-full w-full">
      <img src={resolve(src)} alt={alt} className={className} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/55 text-sm font-semibold text-white opacity-0 transition-opacity group-hover/edimg:opacity-100"
      >
        {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImageUp className="h-6 w-6" />}
        {busy ? "Качване..." : "Смени снимка"}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
    </div>
  );
}
