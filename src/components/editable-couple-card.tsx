"use client";
import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { CoupleMainCard } from "./couple-main-card";
import { defaultCardText, type CardText } from "@/lib/card-text";
import { saveCardText } from "@/app/space/customize/actions";
import styles from "./inline-card-editor.module.css";
export function EditableCoupleCard({text,revision,...props}: {text:CardText;revision:number;name:string;togetherSince:string;timezone:string;initialToday:string}) {
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState(text);
  const [saved,setSaved]=useState(text);
  const [version,setVersion]=useState(revision);
  const pencil=useRef<HTMLButtonElement>(null);
  const router=useRouter();
  const [state,action,pending]=useActionState(async (_previous:{message:string},form:FormData)=>{
    const result=await saveCardText({message:""},form);
    if(result.success){setSaved({...draft});setVersion(result.revision!);setEditing(false);router.refresh();}
    return {message:result.message};
  },{message:""});
  const field=(key:keyof CardText,label:string,max:number)=> <textarea
    className={`${styles.field} ${styles[key]}`} name={key} aria-label={label}
    value={draft[key]} onChange={e=>setDraft({...draft,[key]:e.target.value})}
    rows={key==="ribbon" ? 1 : 2} maxLength={max} required disabled={pending}
    autoFocus={key==="ribbon"} spellCheck={key!=="ribbon"}
  />;
  return <form action={action} className={styles.form}>
    <input type="hidden" name="revision" value={version}/>
    <CoupleMainCard {...props} text={saved}
      controls={!editing ? <button ref={pencil} type="button" className={styles.pencil} aria-label="Customize card" title="Customize card" onClick={()=>{setDraft(saved);setEditing(true);}}><Pencil size={17} aria-hidden="true"/></button> : <span className={styles.badge}>Editing</span>}
      editor={editing ? {ribbon:field("ribbon","Ribbon names",32),heading:field("heading","Main heading",70),message:field("message","Your little message",160)} : undefined}
      footer={editing ? <div className={styles.footer}>
        <p className={styles.hint}>Tap the text to edit · Only Save changes our shared Home.</p>
        <p role="status">{state.message}</p>
        <div className={styles.actions}><button type="button" disabled={pending} onClick={()=>{setDraft(saved);setEditing(false);requestAnimationFrame(()=>pencil.current?.focus());}}>Cancel</button><button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</button></div>
        <button className={styles.reset} type="button" disabled={pending} onClick={()=>setDraft({...defaultCardText})}>Reset to default</button>
      </div> : undefined}/>
  </form>;
}
