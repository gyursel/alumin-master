import { useContent } from "../context/ContentContext";
import { imageUrl } from "../lib/siteImages";
import { API } from "../lib/api";
export function resolveSiteImage(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  const origin = API.replace(/\/api\/?$/, "");
  if (url.startsWith("/api/")) return origin + url;
  if (url.startsWith("/")) return origin + url;
  return url;
}
export function responsiveImageSet(src) {
  if (!src?.startsWith("https://images.unsplash.com/")) return undefined;
  try {
    return [480, 768, 1200].map(w => {
      const url = new URL(src);
      url.searchParams.set("w", String(w));
      url.searchParams.set("q", "72");
      url.searchParams.set("auto", "format");
      return url.toString() + " " + w + "w";
    }).join(", ");
  } catch { return undefined; }
}
export default function SiteImage({slot, fallback, alt="", className=""}) {
  const {content}=useContent();
  const src = imageUrl(content, slot, fallback);
  return <img src={resolveSiteImage(src)} srcSet={responsiveImageSet(src)}
    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 380px"
    alt={alt} className={className} loading="lazy" decoding="async" />;
}
