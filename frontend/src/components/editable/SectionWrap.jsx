import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useContent } from "../../context/ContentContext";

// Wraps a section. In edit mode it can be toggled visible/hidden.
// When hidden in edit mode a placeholder is shown; on the live site it is removed.
export default function SectionWrap({ path, visible, label, children }) {
  const { editMode, update } = useContent();

  if (!editMode) {
    return visible === false ? null : children;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => update(`${path}.visible`, !visible)}
        className="absolute right-4 top-4 z-30 flex items-center gap-1.5 rounded-full border border-gold/50 bg-[#0a0a0b]/90 px-3 py-1.5 text-xs font-medium text-gold backdrop-blur transition-colors hover:bg-gold hover:text-[#0a0a0b]"
        title={visible === false ? "Покажи секцията" : "Скрий секцията"}
      >
        {visible === false ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {visible === false ? "Скрита" : "Видима"}
      </button>
      <div className={visible === false ? "pointer-events-none opacity-40 grayscale" : ""}>
        {children}
      </div>
      {visible === false && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <span className="rounded-lg border border-dashed border-white/30 bg-[#0a0a0b]/70 px-4 py-2 text-sm text-white/70">
            Скрита секция{label ? `: ${label}` : ""} — невидима за посетителите
          </span>
        </div>
      )}
    </div>
  );
}
