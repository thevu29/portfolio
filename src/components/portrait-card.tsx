import type { Profile } from "@/content/cv";
import { cn } from "@/lib/utils";
import { Avatar } from "./primitives";

/**
 * Hero portrait: the avatar on a dark grid card, slightly rotated, which
 * straightens on hover. Shows a large monogram until a photo is added.
 */
export function PortraitCard({ profile, className }: { profile: Profile; className?: string }) {
  return (
    <div
      className={cn(
        "group/portrait bg-card relative aspect-square w-full max-w-[320px] rotate-2 rounded-[2rem] border p-2 shadow-2xl shadow-black/20 transition-transform duration-500 ease-out hover:rotate-0 motion-reduce:transition-none",
        className,
      )}
    >
      <div className="bg-grid relative flex size-full items-center justify-center overflow-hidden rounded-[1.6rem] bg-zinc-950">
        <div
          aria-hidden="true"
          className="absolute -top-1/3 left-1/2 h-2/3 w-2/3 -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
        />
        <Avatar
          profile={profile}
          size={profile.avatar ? 288 : 132}
          className={cn(
            "relative",
            profile.avatar
              ? "size-full rounded-[1.6rem] border-0"
              : "border-white/15 bg-white/5 text-white/80",
          )}
        />
        <span className="absolute right-4 bottom-3 font-mono text-[10px] tracking-widest text-white/40 uppercase">
          {profile.location}
        </span>
      </div>
    </div>
  );
}
