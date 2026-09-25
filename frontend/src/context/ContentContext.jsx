import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

const ContentContext = createContext(null);

function lighten(hex, amount = 0.25) {
  try {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const num = parseInt(h, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;
    r = Math.round(r + (255 - r) * amount);
    g = Math.round(g + (255 - g) * amount);
    b = Math.round(b + (255 - b) * amount);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch {
    return hex;
  }
}

function applyAccent(accent) {
  if (!accent) return;
  const root = document.documentElement;
  root.style.setProperty("--gold", accent);
  root.style.setProperty("--gold-light", lighten(accent, 0.28));
}

function setDeep(obj, path, value) {
  const clone = JSON.parse(JSON.stringify(obj));
  const keys = path.split(".");
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] === undefined) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  return clone;
}

export function ContentProvider({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const wantEdit = params.get("edit") === "1";
  const editMode = Boolean(user?.is_admin && wantEdit);

  const [content, setContent] = useState(null);
  // true чак след като първият отговор от API-то (успешен или неуспешен) е дошъл.
  // Страниците не бива да показват hero снимка/видео преди това - иначе се вижда
  // за части от секундата грешен/стар фон, който после се сменя.
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const saveTimer = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/content?mode=${editMode ? "draft" : "published"}`);
      setContent(res.data);
      applyAccent(res.data?.global?.accent);
    } catch (e) {
      // fall back silently; pages use their own defaults
    } finally {
      setLoaded(true);
    }
  }, [editMode]);

  useEffect(() => {
    load();
  }, [load]);

  const scheduleSave = useCallback((next) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await api.put("/content/draft", next);
        setDirty(false);
      } catch (e) {
        /* ignore */
      } finally {
        setSaving(false);
      }
    }, 700);
  }, []);

  const update = useCallback(
    (path, value) => {
      setContent((prev) => {
        const next = setDeep(prev, path, value);
        if (path === "global.accent") applyAccent(value);
        setDirty(true);
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const publish = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await api.put("/content/draft", content);
    await api.post("/content/publish");
    setDirty(false);
  }, [content]);

  const discard = useCallback(async () => {
    const res = await api.post("/content/discard");
    setContent(res.data.content);
    applyAccent(res.data.content?.global?.accent);
    setDirty(false);
  }, []);

  return (
    <ContentContext.Provider
      value={{ content, editMode, update, publish, discard, saving, dirty, loaded }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}
