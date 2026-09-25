import React, { useEffect, useRef } from "react";
import { useContent } from "../../context/ContentContext";

// Inline-editable text. In edit mode it becomes contentEditable and commits on blur.
export default function EditableText({
  value,
  path,
  as: Tag = "div",
  className = "",
  placeholder = "",
}) {
  const { editMode, update } = useContent();
  const ref = useRef(null);

  useEffect(() => {
    if (editMode && ref.current && ref.current.innerText !== (value || "")) {
      ref.current.innerText = value || "";
    }
  }, [value, editMode]);

  if (!editMode) {
    return <Tag className={className}>{value}</Tag>;
  }

  return (
    <Tag
      ref={ref}
      className={`${className} editable-text`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-placeholder={placeholder}
      onBlur={(e) => update(path, e.currentTarget.innerText.trim())}
    />
  );
}
