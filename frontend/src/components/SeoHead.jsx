import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { company, products } from "../mock";

const SITE = "https://www.dogramadobrich.com";
const pages = {
 "/": ["Алуминиева дограма Добрич | Прозорци и врати", "Производство и монтаж на алуминиева дограма, прозорци, врати и плъзгащи системи в Добрич. Свържете се с нас за измерване и оферта."],
 "/products": ["Алуминиеви прозорци и врати | Дограма Добрич", "Разгледайте алуминиеви прозорци, врати, плъзгащи системи, щори и решения за монтаж на дограма в Добрич."],
 "/about": ["За нас | Дограма Добрич", "Научете повече за Дограма Добрич, производството и монтажа на алуминиева дограма и нашите услуги."],
 "/gallery": ["Галерия с проекти | Дограма Добрич", "Снимки на прозорци, алуминиеви врати, плъзгащи системи и завършени проекти от Дограма Добрич."],
 "/contact": ["Контакти и оферта | Дограма Добрич", "Свържете се с Дограма Добрич за запитване, измерване и оферта за алуминиева дограма и монтаж."]
};
function setMeta(name, value) {
 let el = document.head.querySelector('meta[name="'+name+'"]');
 if (!el) {el=document.createElement("meta");el.setAttribute("name",name);document.head.appendChild(el);}
 el.setAttribute("content",value);
}
export default function SeoHead() {
 const {pathname}=useLocation();
 useEffect(()=>{
   const product = pathname.startsWith("/products/") ? products.find(p=>pathname==="/products/"+p.slug) : null;
   const record=product ? [product.title+" | Дограма Добрич",product.short+" Попитайте за монтаж и оферта в Добрич."] : pages[pathname];
   const title=record?.[0] || "Дограма Добрич";
   const description=record?.[1] || "Алуминиева дограма, прозорци и врати в Добрич.";
   const noIndex=pathname.startsWith("/admin") || pathname.startsWith("/auth");
   document.title=title;
   setMeta("description",description);
   setMeta("robots",noIndex?"noindex, nofollow":"index, follow");
   let canonical=document.head.querySelector('link[rel="canonical"]');
   if(!canonical){canonical=document.createElement("link");canonical.rel="canonical";document.head.appendChild(canonical);}
   if(noIndex)canonical.removeAttribute("href");
   else canonical.href=SITE+(pathname==="/" ? "/" : pathname.replace(/\/$/,""));
   let ld=document.head.querySelector('script[data-site-schema="1"]');
   if(ld)ld.remove();
   if(pathname==="/"){
     ld=document.createElement("script");ld.type="application/ld+json";ld.dataset.siteSchema="1";
     ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"LocalBusiness",name:company.name,url:SITE+"/",telephone:company.phone,address:{"@type":"PostalAddress",streetAddress:"ул. Отец Паисий № 13, вх. Г, ет. 1",addressLocality:"Добрич",postalCode:"9300",addressCountry:"BG"}});
     document.head.appendChild(ld);
   }
 },[pathname]);
 return null;
}
