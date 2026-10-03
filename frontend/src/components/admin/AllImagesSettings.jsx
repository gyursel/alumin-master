import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImageUp, Loader2, UploadCloud } from "lucide-react";
import api from "../../lib/api";
import { imageSlots, imageUrl } from "../../lib/siteImages";
import { resolveSiteImage } from "../SiteImage";

export default function AllImagesSettings() {
 const [draft,setDraft]=useState(null);
 const [busy,setBusy]=useState("");
 const [changed,setChanged]=useState(false);
 const [group,setGroup]=useState("Всички");
 useEffect(()=>{api.get("/content?mode=draft").then(r=>setDraft(r.data)).catch(()=>toast.error("Неуспешно зареждане на снимките."));},[]);
 const upload=async(slot,file)=>{
   if(!file)return;
   if(!["image/jpeg","image/png","image/webp","image/gif"].includes(file.type) || file.size>6*1024*1024){toast.error("Изберете JPG, PNG, WebP или GIF до 6 MB.");return;}
   setBusy(slot.key);
   try{
     const fd=new FormData();fd.append("file",file);
     const res=await api.post("/media",fd,{headers:{"Content-Type":"multipart/form-data"}});
     // Fetch latest saved draft to avoid overwriting unrelated edits.
     const latest=(await api.get("/content?mode=draft")).data;
     const next={...latest,images:{...(latest.images||{}),[slot.key]:res.data.url}};
     // Preserve compatibility with the original visual editor.
     if(slot.legacy){const [root,section,field]=slot.legacy.split(".");next[root]={...(latest[root]||{}),[section]:{...(latest[root]?.[section]||{}),[field]:res.data.url}};}
     await api.put("/content/draft",next);
     setDraft(next);setChanged(true);toast.success("Снимката е сменена в черновата.");
   }catch(e){toast.error(e?.response?.data?.detail||"Грешка при качване.");}
   finally{setBusy("");}
 };
 const publish=async()=>{setBusy("publish");try{await api.post("/content/publish");setChanged(false);toast.success("Снимките и останалите промени в черновата са публикувани.");}catch{toast.error("Грешка при публикуване.");}finally{setBusy("");}};
 if(!draft)return <div className="p-10 text-white/60">Зареждане на изображенията...</div>;
 const groups=["Всички",...new Set(imageSlots.map(x=>x.group))];
 return <div className="mt-8">
   <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#121214] p-4">
    <p className="text-sm text-white/70">Смени всяка снимка поотделно. Качването записва чернова; публикувай, за да се покаже на сайта. Публикуването включва и други запазени чернови.</p>
    <button type="button" disabled={Boolean(busy)} onClick={publish} className="btn-gold flex shrink-0 items-center gap-2 rounded-md px-4 py-2 disabled:opacity-50">{busy==="publish"?<Loader2 className="h-4 w-4 animate-spin"/>:<UploadCloud className="h-4 w-4"/>}Публикувай промените {changed?"•":""}</button>
   </div>
   <div className="my-5 flex flex-wrap gap-2">{groups.map(g=><button key={g} onClick={()=>setGroup(g)} className={`rounded-lg px-3 py-2 text-sm ${group===g?"bg-gold text-black":"border border-white/15 text-white/70"}`}>{g}</button>)}</div>
   <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
   {imageSlots.filter(s=>group==="Всички"||s.group===group).map(slot=><div key={slot.key} className="overflow-hidden rounded-xl border border-white/10 bg-[#121214]">
      <img className="h-48 w-full object-cover" src={resolveSiteImage(imageUrl(draft,slot.key,slot.fallback))} alt={slot.label}/>
      <div className="p-4"><div className="mb-3 text-sm font-semibold">{slot.label}</div>
      <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gold/50 px-3 py-2 text-sm text-gold hover:bg-white/5 ${busy?"pointer-events-none opacity-50":""}`}>
        {busy===slot.key?<Loader2 className="h-4 w-4 animate-spin"/>:<ImageUp className="h-4 w-4"/>}Избери нова снимка
        <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={Boolean(busy)} onChange={e=>{const f=e.target.files?.[0];e.target.value="";upload(slot,f);}}/>
      </label></div>
    </div>)}
   </div>
 </div>;
}
