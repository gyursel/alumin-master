import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

// Handles the Emergent OAuth redirect: reads #session_id, exchanges it on the
// backend, then redirects to the admin dashboard.
export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    const sessionId = match ? decodeURIComponent(match[1]) : null;

    const run = async () => {
      if (!sessionId) {
        navigate("/admin/login", { replace: true });
        return;
      }
      try {
        const res = await api.post("/auth/session", { session_id: sessionId });
        setUser(res.data.user);
        window.history.replaceState(null, "", "/admin");
        navigate("/admin", { replace: true, state: { user: res.data.user } });
      } catch (e) {
        navigate("/admin/login", { replace: true, state: { error: "auth_failed" } });
      }
    };
    run();
  }, [navigate, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-gold" />
        <p className="text-sm text-white/60">Удостоверяване...</p>
      </div>
    </div>
  );
}
