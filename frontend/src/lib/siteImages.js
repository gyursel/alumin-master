import { heroImage, aboutImages, products, galleryImages } from "../mock";
export const imageSlots = [
  {key:"hero", label:"Главна снимка (начало)", group:"Начало", fallback:heroImage, legacy:"sections.hero.image"},
  {key:"why", label:"Защо ние", group:"Начало", fallback:aboutImages.main, legacy:"sections.why.image"},
  ...products.map(p=>({key:"product_"+p.slug,label:p.title,group:"Продукти",fallback:p.image})),
  {key:"about_main",label:"За нас – основна",group:"За нас",fallback:aboutImages.main},
  {key:"about_workshop",label:"За нас – работилница",group:"За нас",fallback:aboutImages.workshop},
  {key:"about_fabrication",label:"За нас – производство",group:"За нас",fallback:aboutImages.fabrication},
  ...galleryImages.map((g,i)=>({key:"gallery_"+i,label:g.title,group:"Галерия – начални снимки",fallback:g.src})),
];
export const imageUrl=(content,key,fallback)=>(key==="hero"?content?.sections?.hero?.image:key==="why"?content?.sections?.why?.image:null) || content?.images?.[key] || fallback;
