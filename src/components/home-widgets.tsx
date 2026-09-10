import Link from "next/link";
import { Heart, ImagePlus, MessageCircleHeart, Sparkles } from "lucide-react";

type Memory = {
  id: string;
  title: string;
  body: string;
  happenedOn: string;
  isMilestone: boolean;
} | null;

export function HomeWidgets({ latest, milestone, memoryCount, heartPhotoSrc }: { latest: Memory; milestone: Memory; memoryCount: number; heartPhotoSrc?: string }) {
  const favorite = milestone ?? latest;
  return <section className="home-widgets" aria-labelledby="little-corners">
    <div className="home-widgets-heading">
      <div><p className="eyebrow">A LITTLE CORNER OF US</p><h2 id="little-corners">Our little shelf.</h2></div>
      <Link href="/space/memories" className="quiet-link">All memories →</Link>
    </div>
    <div className="home-widget-grid">
      <a className="home-widget home-widget-photo" href="#couple-card">
        <span className="home-widget-icon"><ImagePlus size={18} aria-hidden="true" /></span>
        {heartPhotoSrc ? <span className="home-photo-preview" style={{ backgroundImage: `url(${heartPhotoSrc})` }} aria-hidden="true" /> : <span className="home-photo-placeholder" aria-hidden="true">♡</span>}
        <p>OUR PHOTOS</p>
        <small><b>{heartPhotoSrc ? "Change photos ↑" : "Add a photo ↑"}</b></small>
      </a>
      <Link className="home-widget home-widget-jar" href="/space/jar">
        <span className="home-widget-icon"><Sparkles size={19} aria-hidden="true" /></span>
        <p>MEMORY JAR</p>
        <h3>A tiny note for us.</h3>
        <span>Save a little thought to open later.</span>
        <small><b>Open the jar →</b></small>
      </Link>
      <Link className="home-widget home-widget-question" href="/space/questions">
        <span className="home-widget-icon"><MessageCircleHeart size={19} aria-hidden="true" /></span>
        <p>ONE LITTLE QUESTION</p>
        <h3>A shared thought.</h3>
        <span>Answer in private, then read each other’s words together.</span>
        <small><b>Open it →</b></small>
      </Link>
      <Link className="home-widget home-widget-wide home-widget-memory" href={favorite ? `/space/memories/${favorite.id}` : "/space/memories/new"}>
        <span className="home-widget-icon"><Heart size={19} aria-hidden="true" /></span>
        <p>{favorite?.isMilestone ? "A FAVORITE MEMORY" : "OUR LATEST MEMORY"}</p>
        <h3>{favorite ? favorite.title : "Write our first memory."}</h3>
        <span>{favorite ? favorite.body : "A little ordinary day can be worth keeping too."}</span>
        <small>{favorite ? favorite.happenedOn : "Start here"} <b>{memoryCount ? "Open →" : "Write →"}</b></small>
      </Link>
    </div>
  </section>;
}
