import api, { API } from "./api";

// Превръща "/api/media/<id>" в пълен адрес към backend-а (същата логика като EditableImage).
export function resolveMediaUrl(src) {
  if (!src) return null;
  return src.startsWith("/api/") ? `${API}${src.replace(/^\/api/, "")}` : src;
}

// Настройката се зарежда само веднъж за целия сайт (споделен promise + кеш).
let cached = null;
let inflight = null;

export function getVideoBackground() {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = api
      .get("/settings/video-background")
      .then((res) => {
        cached = {
          enabled: Boolean(res.data?.enabled),
          url: resolveMediaUrl(res.data?.url),
        };
        return cached;
      })
      .catch(() => null) // при грешка сайтът просто ползва снимката
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

// Извиква се от Admin Panel след промяна, за да се презареди настройката.
export function invalidateVideoBackground() {
  cached = null;
  inflight = null;
}
