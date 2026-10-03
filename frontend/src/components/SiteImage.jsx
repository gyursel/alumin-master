import { useContent } from "../context/ContentContext";
import { imageUrl } from "../lib/siteImages";
import { API } from "../lib/api";
export function resolveSiteImage(url) {
  return url?.startsWith("/api/") ? API + url.slice(4) : url;
}
export default function SiteImage({slot, fallback, alt="", className=""}) {
  const {content}=useContent();
  return <img src={resolveSiteImage(imageUrl(content,slot,fallback))} alt={alt} className={className} />;
}
