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
export default function SiteImage({slot, fallback, alt="", className=""}) {
  const {content}=useContent();
  return <img src={resolveSiteImage(imageUrl(content,slot,fallback))} alt={alt} className={className} />;
}
